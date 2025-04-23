
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

// Requisitos mínimos para mostrar como checklist
const requisitos = [
  "Área techada y delimitada para instalaciones",
  "Suministro de agua y energía eléctrica",
  "Iluminación y ventilación adecuadas",
  "Herramientas y equipo especializados",
  "Zona de recepción segura para vehículos",
  "Limpieza, señalización y espacios de maniobra",
  "Infraestructura eléctrica para herramientas",
  "Documentación visible y vigente",
];

type FormValues = {
  nombre: string;
  telefono: string;
  taller: boolean;
  taller_direccion: string;
  taller_imagenes: FileList | null;
  certificaciones: string;
  comentarios: string;
};

export default function InstallerRegisterForm({ onRegistered }: { onRegistered?: () => void }) {
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<FormValues>();
  const taller = watch("taller");
  const [uploading, setUploading] = useState(false);

  const onSubmit = async (data: FormValues) => {
    try {
      setUploading(true);
      let imagenUrls: string[] = [];
      if (data.taller && data.taller_imagenes?.length) {
        const files = Array.from(data.taller_imagenes);
        for (let file of files) {
          const filePath = `talleres/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
          const { data: uploadData, error } = await supabase.storage.from("installers").upload(filePath, file);
          if (error) throw error;
          imagenUrls.push(`https://beefjsdgrdeiymzxwxru.supabase.co/storage/v1/object/public/installers/${filePath}`);
        }
      }
      // Guarda el registro en la tabla "gps_installers" usando la tipificación correcta
      const installerPayload: TablesInsert<"gps_installers"> = {
        nombre: data.nombre,
        telefono: data.telefono,
        taller: !!data.taller,
        taller_direccion: data.taller ? data.taller_direccion : null,
        taller_images: imagenUrls,
        certificaciones: data.certificaciones,
        comentarios: data.comentarios,
      };
      const { error: dbError } = await supabase
        .from("gps_installers")
        .insert(installerPayload);
      if (dbError) throw dbError;
      toast.success("Instalador registrado correctamente");
      reset();
      onRegistered?.();
    } catch (e: any) {
      toast.error("Error al registrar instalador: " + (e.message || ""));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto my-6">
      <CardHeader>
        <CardTitle>Registrar Instalador de GPS</CardTitle>
        <ul className="list-disc ml-4 text-sm text-muted-foreground mt-2">
          {requisitos.map(r => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <Input {...register("nombre", { required: true })} placeholder="Nombre del instalador" className="w-full" />
          <Input {...register("telefono", { required: true })} placeholder="Teléfono" type="tel" className="w-full" />
          <label className="flex items-center gap-2 text-sm font-medium mt-2">
            <input type="checkbox" {...register("taller")} />
            ¿El instalador tiene taller propio?
          </label>
          {taller && (
            <>
              <Input {...register("taller_direccion")} placeholder="Dirección del taller" className="w-full" />
              <label className="block text-sm mt-2 mb-1 font-medium">Imágenes del taller (mínimo 1)</label>
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
    </Card>
  );
}
