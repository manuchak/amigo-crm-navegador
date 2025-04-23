
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

export type AddressFields = {
  state: string;
  city: string;
  colonia?: string;
  street: string;
  number: string;
  postalCode: string;
  references?: string;
};

export type FormValues = {
  nombre: string;
  telefono: string;
  email: string;
  direccion_personal: AddressFields;
  rfc: string;
  taller: boolean;
  taller_direccion: string;
  taller_imagenes: FileList | null;
  certificaciones: string;
  comentarios: string;
};

export function useInstaladorRegistroForm() {
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<FormValues>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      nombre: "",
      telefono: "",
      email: "",
      direccion_personal: {
        state: "",
        city: "",
        colonia: "",
        street: "",
        number: "",
        postalCode: "",
        references: "",
      },
      rfc: "",
      taller: false,
      taller_direccion: "",
      taller_imagenes: null,
      certificaciones: "",
      comentarios: "",
    }
  });
  const taller = !!watch("taller");
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

      // Validation: required fields before submit
      if (!data.nombre || !data.telefono || !data.email || !data.rfc ||
        !data.direccion_personal?.state ||
        !data.direccion_personal?.city ||
        !data.direccion_personal?.street ||
        !data.direccion_personal?.number ||
        !data.direccion_personal?.postalCode
      ) {
        toast.error("Por favor, llena todos los campos obligatorios marcados con *");
        setUploading(false);
        return;
      }
      if (taller) {
        if (!data.taller_direccion) {
          toast.error("La dirección del taller es obligatoria.");
          setUploading(false);
          return;
        }
        if (selectedFeatures.length === 0) {
          toast.error("Selecciona al menos una característica del taller.");
          setUploading(false);
          return;
        }
      }

      let imagenUrls: string[] = [];
      if (taller && data.taller_imagenes && data.taller_imagenes.length) {
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
          imagenUrls.push(
            `https://beefjsdgrdeiymzxwxru.supabase.co/storage/v1/object/public/installers/${filePath}`
          );
        }
      }

      // Guarantee arrays for JSON fields to match SQL NOT NULL and DEFAULT constraints
      const safeTallerFeatures = taller ? selectedFeatures : [];
      const safeTallerImages = taller ? imagenUrls : [];

      // Use clean values for nullable/optional fields,
      // direccion_personal de forma compatible al GPSForm
      const payload = {
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email,
        rfc: data.rfc,
        direccion_personal: {
          state: data.direccion_personal.state,
          city: data.direccion_personal.city,
          colonia: data.direccion_personal.colonia || "",
          street: data.direccion_personal.street,
          number: data.direccion_personal.number,
          postalCode: data.direccion_personal.postalCode,
          references: data.direccion_personal.references || ""
        },
        taller: !!taller,
        taller_direccion: taller ? data.taller_direccion : null,
        taller_features: safeTallerFeatures,
        taller_images: safeTallerImages,
        certificaciones: data.certificaciones?.trim() || null,
        comentarios: data.comentarios?.trim() || null,
      };

      // Clean up empty strings to null for optional fields, match column names
      Object.entries(payload).forEach(([key, value]) => {
        if (typeof value === "string" && value.trim() === "") {
          // @ts-ignore
          payload[key] = null;
        }
        // Ensure arrays are NOT null nor undefined
        if (
          (key === "taller_features" || key === "taller_images") &&
          (!Array.isArray(value) || value == null)
        ) {
          // @ts-ignore
          payload[key] = [];
        }
      });

      // Insert into gps_installers
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

  // Para exponer campos individuales opcionalmente en el form padre
  const direccionPersonalFields = {
    state: register("direccion_personal.state", { required: true }),
    city: register("direccion_personal.city", { required: true }),
    colonia: register("direccion_personal.colonia"),
    street: register("direccion_personal.street", { required: true }),
    number: register("direccion_personal.number", { required: true }),
    postalCode: register("direccion_personal.postalCode", { required: true }),
    references: register("direccion_personal.references"),
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
    direccionPersonalFields
  };
}
