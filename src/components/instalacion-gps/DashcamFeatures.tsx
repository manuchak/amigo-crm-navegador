
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
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

const DASHCAM_FEATURES = [
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
        <label className="font-semibold block mb-1">
          ¿Qué funciones adicionales requiere la dashcam?
        </label>
        <div className="flex flex-col gap-2 mb-1 max-w-lg">
          {DASHCAM_FEATURES.map(feat => (
            <label
              key={feat.value}
              className="flex items-center gap-2 cursor-pointer select-none rounded-md px-2 py-1 hover:bg-slate-50"
              style={{ maxWidth: 440 }}
            >
              <Checkbox
                checked={features.includes(feat.value)}
                onCheckedChange={() => handleFeatureToggle(feat.value)}
                id={`dashcam-feature-${feat.value}`}
                className="border-violet-400"
              />
              <span className="text-xs text-gray-800" style={{ whiteSpace: "normal" }}>
                {feat.label}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Selecciona uno o más features opcionales.
        </p>
      </div>
      <div>
        <label className="font-semibold block mb-1">
          Número de cámaras requeridas:
        </label>
        <div className="flex items-center gap-2 mb-1">
          <button
            type="button"
            onClick={() => updateCameraCount(-1)}
            disabled={cameraCount <= 1}
            aria-label="Menos cámaras"
            className="border rounded-full px-2 py-0.5 bg-slate-50 text-violet-700 border-violet-300 disabled:bg-slate-100 disabled:text-gray-300"
          >
            –
          </button>
          <span className="w-7 text-center font-semibold">{cameraCount}</span>
          <button
            type="button"
            onClick={() => updateCameraCount(+1)}
            disabled={cameraCount >= MAX_CAMERAS}
            aria-label="Más cámaras"
            className="border rounded-full px-2 py-0.5 bg-slate-50 text-violet-700 border-violet-300 disabled:bg-slate-100 disabled:text-gray-300"
          >
            +
          </button>
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
