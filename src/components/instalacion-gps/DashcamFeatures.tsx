
import React from "react";
import { Button } from "@/components/ui/button";
import CroquisCamaras from "./CroquisCamaras";

type DashcamFeaturesProps = {
  features: string[];
  onFeatureChange: (newFeatures: string[]) => void;
  cameraCount: number;
  setCameraCount: (count: number) => void;
  cameraPositions: string[];
  setCameraPositions: (positions: string[]) => void;
};

const MAX_CAMERAS = 6;

const POSICIONES: { value: string; label: string }[] = [
  { value: "frontal", label: "Frontal" },
  { value: "cabina", label: "Cabina" },
  { value: "trasera", label: "Trasera" },
  { value: "izquierda", label: "Lateral Izq." },
  { value: "derecha", label: "Lateral Der." },
  { value: "carga", label: "Caja / Carga" },
];

export default function DashcamFeatures({
  features,
  onFeatureChange,
  cameraCount,
  setCameraCount,
  cameraPositions,
  setCameraPositions,
}: DashcamFeaturesProps) {

  // Mejor UI: control de cámaras
  const updateCameraCount = (dir: 1 | -1) => {
    const newCount = Math.max(1, Math.min(MAX_CAMERAS, cameraCount + dir));
    setCameraCount(newCount);
    if (newCount < cameraPositions.length) {
      setCameraPositions(cameraPositions.slice(0, newCount));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-semibold block mb-1">Número de cámaras requeridas:</label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => updateCameraCount(-1)}
            size="icon"
            variant="outline"
            disabled={cameraCount <= 1}
            aria-label="Menos cámaras"
          >-</Button>
          <span className="w-7 text-center">{cameraCount}</span>
          <Button
            type="button"
            onClick={() => updateCameraCount(+1)}
            size="icon"
            variant="outline"
            disabled={cameraCount >= MAX_CAMERAS}
            aria-label="Más cámaras"
          >+</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 mb-2">Elige cuántas cámaras instalar (máx. {MAX_CAMERAS}) y las posiciones exactas.</p>
        <CroquisCamaras
          cameraCount={cameraCount}
          positions={cameraPositions}
          setPositions={setCameraPositions}
          options={POSICIONES}
        />
      </div>
    </div>
  );
}
