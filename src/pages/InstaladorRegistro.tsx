
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

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
  email: string; // sigue siendo parte del formulario, pero no se usará en el insert
  direccion_personal: string;
  rfc: string;
  taller: boolean;
  taller_direccion: string;
  taller_features: string[];
  taller_imagenes: FileList | null;
  certificaciones: string;
  comentarios: string;
};

export default function InstaladorRegistro() {
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<FormValues>();
  const taller = watch("taller");
  const [uploading, setUploading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const navigate = useNavigate();

  // Mejora UX: ver previsualización de imágenes seleccionadas (no subidas aún)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setImagePreviews(Array.from(e.target.files).map(file => URL.createObjectURL(file)));
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(arr =>
      arr.includes(feature)
        ? arr.filter(f => f !== feature)
        : [...arr, feature]
    );
  };

  // Limpiar previews locales y selection extra al resetear
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
      // Payload SIN el campo email, para que coincida con la estructura válida
      const payload = {
        nombre: data.nombre,
        telefono: data.telefono,
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

  return (
    <div className="min-h-screen flex flex-col justify-center px-2 py-10 bg-gradient-to-br from-violet-50 to-violet-200">
      <main className="w-full max-w-2xl mx-auto">
        <Card className="bg-white/90 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Registro de Instalador de GPS</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">Por favor, rellena todos los datos requeridos. Los campos marcados con * son obligatorios.</div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-6"
              autoComplete="off"
            >
              <div>
                <label className="font-medium">Nombre completo *</label>
                <Input {...register("nombre", { required: true })} autoFocus />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Teléfono *</label>
                  <Input {...register("telefono", { required: true })} type="tel" />
                </div>
                <div>
                  <label className="font-medium">Correo electrónico *</label>
                  <Input {...register("email", { required: true })} type="email" />
                </div>
              </div>
              <div>
                <label className="font-medium">RFC para facturación *</label>
                <Input {...register("rfc", { required: true })} />
              </div>
              <div>
                <label className="font-medium">Dirección personal *</label>
                <Input {...register("direccion_personal", { required: true })} />
              </div>

              <div>
                <label className="flex items-center gap-2 font-medium">
                  <input type="checkbox" {...register("taller")} />
                  ¿El instalador tiene taller propio?
                </label>
              </div>

              {taller && (
                <div className="space-y-4 bg-violet-50 p-4 rounded-lg border border-violet-200">
                  <div>
                    <label className="font-medium">Dirección del taller *</label>
                    <Input {...register("taller_direccion", { required: taller })} />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Características del taller *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {workshopFeatures.map(f => (
                        <label key={f.value} className="flex items-center gap-2 text-sm">
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
                  <div>
                    <label className="block font-medium mb-2">Imágenes del taller (puede cargar varias)</label>
                    <Input
                      {...register("taller_imagenes")}
                      multiple
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreviews.length > 0 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                        {imagePreviews.map((url, i) => (
                          <img
                            key={url}
                            src={url}
                            className="w-20 h-20 object-cover rounded border"
                            alt={`Vista previa taller ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="font-medium">Certificaciones relevantes</label>
                <Input {...register("certificaciones")} />
              </div>
              <div>
                <label className="font-medium">Comentarios (opcional)</label>
                <Input {...register("comentarios")} />
              </div>
              <Button className="mt-3 w-full" type="submit" disabled={isSubmitting || uploading}>
                {uploading || isSubmitting ? (
                  <span className="flex items-center gap-2"><UploadCloud className="animate-bounce" />Enviando…</span>
                ) : "Registrar Instalador"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
