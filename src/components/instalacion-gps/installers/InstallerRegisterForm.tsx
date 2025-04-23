
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Características requeridas del taller
const workshopFeatures = [
  { label: "Área techada y delimitada para instalaciones", value: "area_techada" },
  { label: "Suministro de agua y energía eléctrica", value: "agua_energia" },
  { label: "Iluminación y ventilación adecuadas", value: "iluminacion_ventilacion" },
  { label: "Herramientas y equipo especializados", value: "herramientas_equipo" },
  { label: "Zona de recepción segura para vehículos", value: "zona_recepcion" },
  { label: "Limpieza, señalización y espacios de maniobra", value: "limpieza_senalizacion" },
  { label: "Infraestructura eléctrica para herramientas", value: "infraestructura_electrica" },
  { label: "Documentación visible y vigente", value: "documentacion_visible" },
];

type FormValues = {
  nombre: string;
  telefono: string;
  email: string;
  direccion_personal: string;
  rfc: string;
  taller: boolean;
  taller_direccion: string;
  taller_features: string[];
  taller_imagenes: FileList | null;
  certificaciones: string;
  comentarios: string;
};

export default function InstallerRegisterForm({ onRegistered }: { onRegistered?: () => void }) {
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<FormValues>();
  const taller = watch("taller");
  const [uploading, setUploading] = useState(false);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(arr =>
      arr.includes(feature)
        ? arr.filter(f => f !== feature)
        : [...arr, feature]
    );
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setUploading(true);
      let imagenUrls: string[] = [];
      if (taller && data.taller_imagenes?.length) {
        const files = Array.from(data.taller_imagenes);
        for (let file of files) {
          const filePath = `talleres/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
          const { data: uploadData, error } = await supabase.storage.from("installers").upload(filePath, file);
          if (error) throw error;
          imagenUrls.push(`https://beefjsdgrdeiymzxwxru.supabase.co/storage/v1/object/public/installers/${filePath}`);
        }
      }

      // Construye el payload
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

      // Insertar en la tabla gps_installers (se ignorarán campos excedentes si no existen en BD)
      const { error: dbError } = await supabase
        .from("gps_installers")
        .insert(payload);
      if (dbError) throw dbError;
      toast.success("Instalador registrado correctamente");
      reset();
      setSelectedFeatures([]);
      onRegistered?.();
    } catch (e: any) {
      toast.error("Error al registrar instalador: " + (e.message || ""));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="grid gap-4">
        <Input {...register("nombre", { required: true })} placeholder="Nombre completo del instalador" className="w-full" />
        <Input {...register("telefono", { required: true })} placeholder="Teléfono" type="tel" className="w-full" />
        <Input {...register("email", { required: true })} placeholder="Correo electrónico" type="email" className="w-full" />
        <Input {...register("rfc", { required: true })} placeholder="RFC para facturación" className="w-full" />
        <Input {...register("direccion_personal", { required: true })} placeholder="Dirección personal" className="w-full" />

        <label className="flex items-center gap-2 text-sm font-medium mt-2">
          <input type="checkbox" {...register("taller")} />
          ¿El instalador tiene taller propio?
        </label>

        {taller && (
          <>
            <Input {...register("taller_direccion", { required: taller })} placeholder="Dirección del taller" className="w-full" />
            <div>
              <label className="block text-sm mt-2 mb-1 font-medium">Características del taller</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workshopFeatures.map(f => (
                  <label key={f.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(f.value)}
                      onChange={() => handleFeatureToggle(f.value)}
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="block text-sm mt-2 mb-1 font-medium">Imágenes del taller (puede cargar varias)</label>
            <Input {...register("taller_imagenes")} multiple type="file" accept="image/*" />
          </>
        )}
        <Input {...register("certificaciones")} placeholder="Certificaciones relevantes" className="w-full" />
        <Input {...register("comentarios")} placeholder="Comentarios (opcional)" className="w-full" />
        <Button className="mt-3" type="submit" disabled={isSubmitting || uploading}>
          {uploading || isSubmitting ? (
            <span className="flex items-center gap-2"><UploadCloud className="animate-bounce" />Enviando…</span>
          ) : "Registrar Instalador"}
        </Button>
      </CardContent>
    </form>
  );
}
