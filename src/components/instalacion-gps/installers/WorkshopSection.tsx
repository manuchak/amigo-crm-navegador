
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
}

export function WorkshopSection({
  taller,
  register,
  selectedFeatures,
  handleFeatureToggle,
  handleImageChange,
  imagePreviews
}: WorkshopSectionProps) {
  if (!taller) return null;
  return (
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
        <ImagePreviewList imagePreviews={imagePreviews} />
      </div>
    </div>
  );
}
