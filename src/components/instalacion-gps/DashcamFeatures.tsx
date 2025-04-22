
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

const MAX_CAMERAS = 4;

const POSICIONES: { value: string; label: string }[] = [
  { value: "frontal", label: "Frontal" },
  { value: "lateral_izq", label: "Lateral Izq." },
  { value: "lateral_der", label: "Lateral Der." },
  { value: "cajuela", label: "Cajuela" },
];

const ADAS_FEATURES = [
  { value: "adas", label: "ADAS (Asistencia Avanzada al Conductor)" },
  { value: "dms", label: "DMS (Monitoreo de Conductor)" },
  { value: "grabacion_eventos", label: "Grabación automática de eventos" },
  { value: "gps", label: "Localización GPS" },
  { value: "alarma_movimiento", label: "Alarma por movimiento" },
];

export default function DashcamFeatures({
  features,
  onFeatureChange,
  cameraCount,
  setCameraCount,
  cameraPositions,
  setCameraPositions,
}: DashcamFeaturesProps) {
  // Control del número de cámaras y recorte de ubicaciones si hay menos seleccionadas
  const updateCameraCount = (dir: 1 | -1) => {
    const newCount = Math.max(1, Math.min(MAX_CAMERAS, cameraCount + dir));
    setCameraCount(newCount);
    if (newCount < cameraPositions.length) {
      setCameraPositions(cameraPositions.slice(0, newCount));
    }
  };

  // UX feature toggle handler
  const handleFeatureToggle = (value: string) => {
    const exists = features.includes(value);
    onFeatureChange(
      exists ? features.filter(f => f !== value) : [...features, value]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="font-semibold block mb-1">¿Qué funciones adicionales requiere la dashcam?</label>
        <div className="flex flex-wrap gap-2 mb-1">
          {ADAS_FEATURES.map((feat) => (
            <button
              key={feat.value}
              onClick={() => handleFeatureToggle(feat.value)}
              type="button"
              className={
                "rounded-full border px-3 py-2 text-xs transition-all font-semibold flex-shrink-0 whitespace-nowrap " +
                (features.includes(feat.value)
                  ? "bg-violet-600 text-white border-violet-700 scale-105 shadow"
                  : "bg-slate-50 border-slate-300 text-gray-800 hover:bg-slate-100")
              }
              style={{ maxWidth: 210, textOverflow: "ellipsis", overflow: "hidden" }}
              title={feat.label}
            >
              {feat.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Selecciona uno o más features opcionales.
        </p>
      </div>
      <div>
        <label className="font-semibold block mb-1">Número de cámaras requeridas:</label>
        <div className="flex items-center gap-2 mb-1">
          <Button
            type="button"
            onClick={() => updateCameraCount(-1)}
            size="icon"
            variant="outline"
            disabled={cameraCount <= 1}
            aria-label="Menos cámaras"
          >-</Button>
          <span className="w-7 text-center font-semibold">{cameraCount}</span>
          <Button
            type="button"
            onClick={() => updateCameraCount(+1)}
            size="icon"
            variant="outline"
            disabled={cameraCount >= MAX_CAMERAS}
            aria-label="Más cámaras"
          >+</Button>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Elige cuántas cámaras instalar (máx. {MAX_CAMERAS}) y las posiciones exactas.
        </p>
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
