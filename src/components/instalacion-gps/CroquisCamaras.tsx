
import React from "react";

type CroquisCamarasProps = {
  cameraCount: number;
  positions: string[];
  setPositions: (pos: string[]) => void;
  options: { value: string; label: string }[];
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

  // Mejor distribución y tamaño para labels y círculos
  const posDict: Record<string, {cx: number, cy: number, labelDx?: number, labelDy?: number}> = {
    frontal:      { cx: 120, cy: 35, labelDy: -15 },
    cabina:       { cx: 120, cy: 63, labelDy: 38 },
    trasera:      { cx: 120, cy: 93, labelDy: 18 },
    izquierda:    { cx: 44, cy: 63, labelDx: -50 },
    derecha:      { cx: 196, cy: 63, labelDx: 50 },
    carga:        { cx: 160, cy: 75, labelDx: 40, labelDy: 30 }, // Ejemplo: caja/carga
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={280} height={128} viewBox="0 0 240 110" className="mx-auto rounded animate-fade-in" style={{ background: "#fff" }}>
          {/* Croquis: Vista superior más similar a la imagen de referencia */}
          <rect x="30" y="30" width="180" height="55" rx="20" fill="#E0E7FF" stroke="#6366f1" strokeWidth="2"/>
          {/* Parabrisas delantero */}
          <rect x="95" y="33" width="50" height="10" rx="6" fill="#6366f1" opacity="0.3" />
          {/* Parabrisas trasero */}
          <rect x="95" y="75" width="50" height="10" rx="6" fill="#6366f1" opacity="0.3" />
          {/* Llantas */}
          <ellipse cx="42" cy="33" rx="8" ry="5" fill="#b3bac6" opacity="0.7"/>
          <ellipse cx="198" cy="33" rx="8" ry="5" fill="#b3bac6" opacity="0.7"/>
          <ellipse cx="42" cy="85" rx="8" ry="5" fill="#b3bac6" opacity="0.7"/>
          <ellipse cx="198" cy="85" rx="8" ry="5" fill="#b3bac6" opacity="0.7"/>
          {/* Puntos interactivos para cámaras */}
          {options.map((opt) => {
            const conf = posDict[opt.value] || { cx: 120, cy: 63 };
            const selected = positions.includes(opt.value);
            // floating label
            return (
              <g key={opt.value}>
                <circle
                  cx={conf.cx}
                  cy={conf.cy}
                  r={selected ? 14 : 11}
                  fill={selected ? "#22c55e" : "#60a5fa"}
                  stroke="#6366f1"
                  strokeWidth={selected ? 3 : 2}
                  cursor="pointer"
                  onClick={() => handleSelect(opt.value)}
                  tabIndex={0}
                  aria-label={opt.label}
                />
                <text
                  x={conf.cx + (conf.labelDx || 0)}
                  y={conf.cy + (conf.labelDy ?? 0)}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#374151"
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {opt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-2 justify-center max-w-full">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={`text-xs min-w-[80px] px-3 py-1 rounded-full border whitespace-nowrap flex-shrink-0 ${positions.includes(opt.value) ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 border-slate-300"}`}
            disabled={positions.length >= cameraCount && !positions.includes(opt.value)}
            type="button"
            style={{ fontWeight: 500 }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        Selecciona {cameraCount} ubicación{cameraCount > 1 ? "es" : ""} en el croquis.
      </div>
    </div>
  );
}
