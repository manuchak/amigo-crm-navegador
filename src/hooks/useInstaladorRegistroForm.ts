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
  taller_direccion: AddressFields;
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
      taller_direccion: {
        state: "",
        city: "",
        colonia: "",
        street: "",
        number: "",
        postalCode: "",
        references: "",
      },
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
        const addr = data.taller_direccion;
        if (
          !addr.state ||
          !addr.city ||
          !addr.street ||
          !addr.number ||
          !addr.postalCode
        ) {
          toast.error("Llena todos los campos obligatorios de la dirección del taller.");
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

      const address = {
        state: data.direccion_personal.state,
        city: data.direccion_personal.city,
        colonia: data.direccion_personal.colonia || "",
        street: data.direccion_personal.street,
        number: data.direccion_personal.number,
        postalCode: data.direccion_personal.postalCode,
        references: data.direccion_personal.references || ""
      };
      const tallerAddress = taller
        ? {
            state: data.taller_direccion.state,
            city: data.taller_direccion.city,
            colonia: data.taller_direccion.colonia || "",
            street: data.taller_direccion.street,
            number: data.taller_direccion.number,
            postalCode: data.taller_direccion.postalCode,
            references: data.taller_direccion.references || ""
          }
        : {
            state: null, city: null, colonia: null, street: null, number: null, postalCode: null, references: null
          };

      const safeTallerFeatures = taller ? selectedFeatures : [];
      const safeTallerImages = taller ? imagenUrls : [];

      const payload = {
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email,
        rfc: data.rfc,
        direccion_personal: JSON.stringify(address),
        direccion_personal_state: address.state,
        direccion_personal_city: address.city,
        direccion_personal_colonia: address.colonia,
        direccion_personal_street: address.street,
        direccion_personal_number: address.number,
        direccion_personal_postal_code: address.postalCode,
        direccion_personal_references: address.references,
        taller: !!taller,
        taller_direccion: taller ? JSON.stringify(tallerAddress) : null,
        taller_direccion_state: tallerAddress.state,
        taller_direccion_city: tallerAddress.city,
        taller_direccion_colonia: tallerAddress.colonia,
        taller_direccion_street: tallerAddress.street,
        taller_direccion_number: tallerAddress.number,
        taller_direccion_postal_code: tallerAddress.postalCode,
        taller_direccion_references: tallerAddress.references,
        taller_features: safeTallerFeatures,
        taller_images: safeTallerImages,
        certificaciones: data.certificaciones?.trim() || null,
        comentarios: data.comentarios?.trim() || null,
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (typeof value === "string" && value.trim() === "") {
          // @ts-ignore
          payload[key] = null;
        }
        if (
          (key === "taller_features" || key === "taller_images") &&
          (!Array.isArray(value) || value == null)
        ) {
          // @ts-ignore
          payload[key] = [];
        }
      });

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

  const direccionPersonalFields = {
    state: register("direccion_personal.state", { required: true }),
    city: register("direccion_personal.city", { required: true }),
    colonia: register("direccion_personal.colonia"),
    street: register("direccion_personal.street", { required: true }),
    number: register("direccion_personal.number", { required: true }),
    postalCode: register("direccion_personal.postalCode", { required: true }),
    references: register("direccion_personal.references"),
  };

  const tallerDireccionFields = {
    state: register("taller_direccion.state", { required: taller }),
    city: register("taller_direccion.city", { required: taller }),
    colonia: register("taller_direccion.colonia"),
    street: register("taller_direccion.street", { required: taller }),
    number: register("taller_direccion.number", { required: taller }),
    postalCode: register("taller_direccion.postalCode", { required: taller }),
    references: register("taller_direccion.references"),
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
    direccionPersonalFields,
    tallerDireccionFields,
  };
}
