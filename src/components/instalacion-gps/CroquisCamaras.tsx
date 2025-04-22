
import React from "react";

type CroquisCamarasProps = {
  cameraCount: number;
  positions: string[];
  setPositions: (pos: string[]) => void;
  options: { value: string; label: string }[];
};

// Paleta de tonos violeta/gris neutro
const CAR_BODY = "#E7E2F7";
const CAR_OUTLINE = "#7153C4";
const CAMERA_SELECTED = "#22c55e";
const CAMERA_AVAILABLE = "#818CF8";

const POSITIONS: Record<
  string,
  { cx: number; cy: number; label: string; labelDx?: number; labelDy?: number }
> = {
  frontal:      { cx: 120, cy: 36, label: "Frontal", labelDy: -18 },
  lateral_izq:  { cx: 55,  cy: 80, label: "Lateral Izq.", labelDx: -50 },
  lateral_der:  { cx: 185, cy: 80, label: "Lateral Der.", labelDx: 54 },
  cajuela:      { cx: 120, cy: 128, label: "Cajuela", labelDy: 20 },
};

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
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="relative">
        <svg width={240} height={160} viewBox="0 0 240 160" className="mx-auto" style={{ background: "#fff" }}>
          {/* Silueta superior de sedán, simplificado */}
          <ellipse 
            cx="120" cy="82" rx="74" ry="44"
            fill={CAR_BODY}
            stroke={CAR_OUTLINE}
            strokeWidth="4"
          />
          {/* Cabina */}
          <ellipse 
            cx="120" cy="82" rx="44" ry="27"
            fill="#BBADE7"
            stroke={CAR_OUTLINE}
            strokeWidth="2"
            opacity="0.75"
          />
          {/* Parabrisas delantero */}
          <rect 
            x="88" y="36" width="64" height="14"
            rx="7"
            fill="#A897D4"
            opacity="0.28"
          />
          {/* Parabrisas trasero */}
          <rect 
            x="88" y="110" width="64" height="14"
            rx="7"
            fill="#A897D4"
            opacity="0.28"
          />
          {/* Puntos interactivos para seleccionar cámaras */}
          {options.map((opt) => {
            const conf = POSITIONS[opt.value];
            if (!conf) return null;
            const selected = positions.includes(opt.value);
            return (
              <g key={opt.value} tabIndex={0} aria-label={conf.label}>
                <circle
                  cx={conf.cx}
                  cy={conf.cy}
                  r={selected ? 15 : 12}
                  fill={selected ? CAMERA_SELECTED : CAMERA_AVAILABLE}
                  stroke={CAR_OUTLINE}
                  strokeWidth={selected ? 3 : 2}
                  style={{ cursor: "pointer" }}
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
      <div className="flex flex-wrap gap-2 justify-center w-full max-w-[340px]">
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
