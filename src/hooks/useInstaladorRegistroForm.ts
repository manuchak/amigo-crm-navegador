
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const workshopFeatures = [
  { label: "Área techada y delimitada para instalaciones", value: "area_techada" },
  { label: "Suministro de agua y energía eléctrica", value: "agua_energia" },
  { label: "Iluminación y ventilación adecuadas", value: "iluminacion_ventilacion" },
  { label: "Herramientas y equipo especializados", value: "herramientas_equipo" },
  { label: "Zona de recepción segura para vehículos", value: "zona_recepcion" },
  { label: "Limpieza, señalización y espacios de maniobra", value: "limpieza_senalizacion" },
  { label: "Infraestructura eléctrica para herramientas", value: "infraestructura_electrica" },
  { label: "Documentación visible y vigente", value: "documentacion_visible" },
];

export type FormValues = {
  nombre: string;
  telefono: string;
  email: string; // ahora usada en el insert
  direccion_personal: string;
  rfc: string;
  taller: boolean;
  taller_direccion: string;
  taller_features: string[];
  taller_imagenes: FileList | null;
  certificaciones: string;
  comentarios: string;
};

export function useInstaladorRegistroForm() {
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<FormValues>();
  const taller = watch("taller");
  const [uploading, setUploading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(arr =>
      arr.includes(feature)
        ? arr.filter(f => f !== feature)
        : [...arr, feature]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setImagePreviews(Array.from(e.target.files).map(file => URL.createObjectURL(file)));
  };

  const cleanUpImages = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setUploading(true);
      let imagenUrls: string[] = [];
      if (taller && data.taller_imagenes?.length) {
        const files = Array.from(data.taller_imagenes);
        for (let file of files) {
          const filePath = `talleres/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
          const { error } = await supabase.storage.from("installers").upload(filePath, file);
          if (error) {
            if (error.message?.toLowerCase().includes("bucket")) {
              throw new Error("No se encontró el bucket para imágenes. Contacta al administrador.");
            }
            throw error;
          }
          imagenUrls.push(`https://beefjsdgrdeiymzxwxru.supabase.co/storage/v1/object/public/installers/${filePath}`);
        }
      }
      const payload = {
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email,
        direccion_personal: data.direccion_personal,
        rfc: data.rfc,
        taller: taller ? true : false,
        taller_direccion: taller ? data.taller_direccion : null,
        taller_features: taller ? selectedFeatures : [],
        taller_images: imagenUrls,
        certificaciones: data.certificaciones,
        comentarios: data.comentarios,
      };

      const { error: dbError } = await supabase.from("gps_installers").insert(payload);
      if (dbError) throw dbError;
      toast.success("Instalador registrado correctamente");
      reset();
      setSelectedFeatures([]);
      cleanUpImages();
      navigate("/instalacion-gps/instaladores");
    } catch (e: any) {
      let friendly = typeof e?.message === "string" && e.message.includes("bucket")
        ? "Ocurrió un problema interno con el almacenamiento de imágenes. Por favor, contacta a soporte."
        : e?.message || "Error desconocido";
      toast.error("Error al registrar instalador: " + friendly);
    } finally {
      setUploading(false);
    }
  };

  return {
    register,
    handleSubmit,
    isSubmitting,
    uploading,
    taller,
    selectedFeatures,
    handleFeatureToggle,
    handleImageChange,
    imagePreviews,
    cleanUpImages,
    onSubmit,
    setSelectedFeatures,
    reset,
  };
}
