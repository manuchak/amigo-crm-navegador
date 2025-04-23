
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { WorkshopSection } from "@/components/instalacion-gps/installers/WorkshopSection";
import { useInstaladorRegistroForm } from "@/hooks/useInstaladorRegistroForm";

export default function InstaladorRegistro() {
  const {
    register,
    handleSubmit,
    isSubmitting,
    uploading,
    taller,
    selectedFeatures,
    handleFeatureToggle,
    handleImageChange,
    imagePreviews,
    onSubmit,
  } = useInstaladorRegistroForm();

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

              <WorkshopSection
                taller={taller}
                register={register}
                selectedFeatures={selectedFeatures}
                handleFeatureToggle={handleFeatureToggle}
                handleImageChange={handleImageChange}
                imagePreviews={imagePreviews}
              />

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
