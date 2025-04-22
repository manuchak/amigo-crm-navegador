
import React from "react";

type CroquisCamarasProps = {
  cameraCount: number;
  positions: string[];
  setPositions: (pos: string[]) => void;
  options: { value: string; label: string }[];
};

// Solo se permiten las ubicaciones del enunciado
const POSITIONS: Record<string, { cx: number; cy: number; label: string; labelDx?: number; labelDy?: number }> = {
  frontal:      { cx: 120, cy: 30, label: "Frontal", labelDy: -20 },
  lateral_izq:  { cx: 50,  cy: 70, label: "Lateral Izq.", labelDx: -40 },
  lateral_der:  { cx: 190, cy: 70, label: "Lateral Der.", labelDx: 45 },
  cajuela:      { cx: 120, cy: 108, label: "Cajuela", labelDy: 27 },
};

// paleta pastel violeta/gris neutro
const CAR_BODY_COLOR = "#E5DEFF";
const CAR_DETAILS_COLOR = "#9b87f5";
const WHEEL_COLOR = "#8E9196";

export default function CroquisCamaras({ cameraCount, positions, setPositions, options }: CroquisCamarasProps) {
  // Permite al usuario seleccionar posiciones diferentes para las cámaras.
  const handleSelect = (value: string) => {
    let newPos: string[] = [...positions];
    if (newPos.includes(value)) {
      newPos = newPos.filter(p => p !== value);
    } else if (newPos.length < cameraCount) {
      newPos.push(value);
    }
    setPositions(newPos.slice(0, cameraCount));
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="relative">
        <svg width={260} height={150} viewBox="0 0 240 145" className="mx-auto rounded" style={{ background: "#fff" }}>
          {/* Carro: sedan visto desde arriba simplificado */}
          {/* Cuerpo principal del auto */}
          <rect
            x="45"
            y="25"
            width="150"
            height="95"
            rx="48"
            fill={CAR_BODY_COLOR}
            stroke={CAR_DETAILS_COLOR}
            strokeWidth="4"
          />
          {/* parabrisas delantero */}
          <rect x="95" y="27" width="50" height="16" rx="8" fill={CAR_DETAILS_COLOR} opacity="0.18"/>
          {/* parabrisas trasero */}
          <rect x="95" y="102" width="50" height="16" rx="8" fill={CAR_DETAILS_COLOR} opacity="0.18"/>
          {/* 4 llantas */}
          <ellipse cx="55" cy="33" rx="12" ry="8" fill={WHEEL_COLOR} opacity="0.7" />
          <ellipse cx="185" cy="33" rx="12" ry="8" fill={WHEEL_COLOR} opacity="0.7" />
          <ellipse cx="55" cy="112" rx="12" ry="8" fill={WHEEL_COLOR} opacity="0.7" />
          <ellipse cx="185" cy="112" rx="12" ry="8" fill={WHEEL_COLOR} opacity="0.7" />
          {/* puntos interactivos para cámaras */}
          {options.map((opt) => {
            const conf = POSITIONS[opt.value];
            if (!conf) return null;
            const selected = positions.includes(opt.value);
            // Punto y leyenda flotante
            return (
              <g key={opt.value} tabIndex={0} aria-label={conf.label}>
                <circle
                  cx={conf.cx}
                  cy={conf.cy}
                  r={selected ? 15 : 12}
                  fill={selected ? "#22c55e" : "#60a5fa"}
                  stroke="#6366f1"
                  strokeWidth={selected ? 3 : 2}
                  cursor="pointer"
                  onClick={() => handleSelect(opt.value)}
                />
                <text
                  x={conf.cx + (conf.labelDx || 0)}
                  y={conf.cy + (conf.labelDy ?? 0)}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#403E43"
                  fontWeight={selected ? "bold" : 400}
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {conf.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-2 justify-center w-full max-w-[350px]">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={`text-xs min-w-[75px] px-3 py-1 rounded-full border whitespace-nowrap flex-shrink-0 overflow-hidden text-ellipsis ${
              positions.includes(opt.value)
                ? "bg-emerald-500 text-white border-emerald-600"
                : "bg-slate-50 border-slate-300"
            }`}
            disabled={positions.length >= cameraCount && !positions.includes(opt.value)}
            type="button"
            style={{ fontWeight: 500, maxWidth: 105 }}
            title={opt.label}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground text-center px-2">
        Selecciona {cameraCount} ubicación{cameraCount > 1 ? "es" : ""} en el croquis.
      </div>
    </div>
  );
}
