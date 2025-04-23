
import React from "react";
import { Input } from "@/components/ui/input";
import { workshopFeatures } from "@/hooks/useInstaladorRegistroForm";
import { ImagePreviewList } from "./ImagePreviewList";

interface WorkshopSectionProps {
  taller: boolean;
  register: any;
  selectedFeatures: string[];
  handleFeatureToggle: (feature: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreviews: string[];
  tallerDireccionFields?: any; // Nuevo prop
}

export function WorkshopSection({
  taller,
  register,
  selectedFeatures,
  handleFeatureToggle,
  handleImageChange,
  imagePreviews,
  tallerDireccionFields,
}: WorkshopSectionProps) {
  if (!taller) return null;
  return (
    <div className="space-y-4 bg-violet-50 p-4 rounded-lg border border-violet-200">
      <div>
        <label className="font-medium">Dirección del taller *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs">Estado *</label>
            <Input {...(tallerDireccionFields?.state || register("taller_direccion.state", { required: taller }))} placeholder="Ej: Jalisco" />
          </div>
          <div>
            <label className="text-xs">Ciudad *</label>
            <Input {...(tallerDireccionFields?.city || register("taller_direccion.city", { required: taller }))} placeholder="Ej: Guadalajara" />
          </div>
          <div>
            <label className="text-xs">Colonia</label>
            <Input {...(tallerDireccionFields?.colonia || register("taller_direccion.colonia"))} placeholder="Colonia/Barrio/Fraccionamiento" />
          </div>
          <div>
            <label className="text-xs">Calle *</label>
            <Input {...(tallerDireccionFields?.street || register("taller_direccion.street", { required: taller }))} placeholder="Ej: Av. Vallarta" />
          </div>
          <div>
            <label className="text-xs">Número *</label>
            <Input {...(tallerDireccionFields?.number || register("taller_direccion.number", { required: taller }))} placeholder="Ej: 123" />
          </div>
          <div>
            <label className="text-xs">Código Postal *</label>
            <Input {...(tallerDireccionFields?.postalCode || register("taller_direccion.postalCode", { required: taller }))} placeholder="Ej: 44100" />
          </div>
        </div>
        <div className="mt-2">
          <label className="text-xs">Referencias</label>
          <Input {...(tallerDireccionFields?.references || register("taller_direccion.references"))} placeholder="Entre calles o señas" />
        </div>
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
        <ImagePreviewList imagePreviews={imagePreviews} />
      </div>
    </div>
  );
}
