
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import CroquisCamaras from "./CroquisCamaras";

type DashcamFeaturesProps = {
  features: string[];
  onFeatureChange: (newFeatures: string[]) => void;
  cameraCount: number;
  setCameraCount: (count: number) => void;
  cameraPositions: string[];
  setCameraPositions: (positions: string[]) => void;
};

const DASHCAM_FEATURES = [
  { label: "ADAS - Asist. Avanzada de Conducción", value: "adas" },
  { label: "DMS - Monitoreo del conductor (fatiga, celular, cigarro)", value: "dms" },
  { label: "Transmisión en tiempo real", value: "streaming" },
  { label: "Grabación de video local", value: "local_recording" },
  { label: "Alerta de desvío de carril", value: "lane_departure" },
  { label: "Reconocimiento de placas", value: "lpr" },
  { label: "Audio en cabina, altavoz/micrófono", value: "audio" },
];

const MAX_CAMERAS = 6;
const POSICIONES: { value: string; label: string }[] = [
  { value: "frontal", label: "Frontal" },
  { value: "cabina", label: "Cabina" },
  { value: "trasera", label: "Trasera" },
  { value: "izquierda", label: "Lateral Izq." },
  { value: "derecha", label: "Lateral Der." },
  { value: "carga", label: "Caja/Carga" },
];

export default function DashcamFeatures({
  features,
  onFeatureChange,
  cameraCount,
  setCameraCount,
  cameraPositions,
  setCameraPositions,
}: DashcamFeaturesProps) {
  // Selección toggle de features
  const handleFeatureClick = (val: string) => {
    if (features.includes(val)) {
      onFeatureChange(features.filter(f => f !== val));
    } else {
      onFeatureChange([...features, val]);
    }
  };

  // Cambiar cámaraCount: + y -
  const updateCameraCount = (dir: 1 | -1) => {
    const newCount = Math.max(1, Math.min(MAX_CAMERAS, cameraCount + dir));
    setCameraCount(newCount);
    // Si baja el número de cámaras, reducir posiciones.
    if (newCount < cameraPositions.length) {
      setCameraPositions(cameraPositions.slice(0, newCount));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-2">Funciones avanzadas de Dashcam</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {DASHCAM_FEATURES.map((f) => (
            <Button
              type="button"
              size="sm"
              key={f.value}
              onClick={() => handleFeatureClick(f.value)}
              variant={features.includes(f.value) ? "default" : "outline"}
              className="rounded-full justify-start"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

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
        <p className="text-xs text-muted-foreground mt-1 mb-2">Elige el número de cámaras a instalar (hasta {MAX_CAMERAS}) y selecciona su ubicación en el croquis.</p>
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
