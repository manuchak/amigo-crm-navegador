
import React from "react";
// Simple croquis de vehículo donde se seleccionan "puntos" para instalar cámaras.
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

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={240} height={100} className="mb-0" viewBox="0 0 240 100">
        {/* Carro estilizado */}
        <rect x="40" y="40" width="160" height="40" rx="12" fill="#E0E7FF" stroke="#6366f1" strokeWidth="2"/>
        {/* Frente */}
        <ellipse cx="40" cy="60" rx="15" ry="20" fill="#6366f1" opacity="0.2"/>
        {/* Trasera */}
        <ellipse cx="200" cy="60" rx="13" ry="17" fill="#6366f1" opacity="0.2"/>
        {/* Cámaras interactivas */}
        {options.map((opt, idx) => {
          // Posiciones de los "puntos" sobre el croquis (simples para demo)
          const posDict: Record<string, [number, number]> = {
            frontal: [48, 45],
            cabina: [120, 64],
            trasera: [192, 78],
            izquierda: [65, 77],
            derecha: [175, 49],
            carga: [130, 85],
          };
          const [cx, cy] = posDict[opt.value] || [120, 60];
          const selected = positions.includes(opt.value);

          return (
            <g key={opt.value}>
              <circle
                cx={cx}
                cy={cy}
                r={selected ? 13 : 10}
                fill={selected ? "#22c55e" : "#a5b4fc"}
                stroke="#6366f1"
                strokeWidth={selected ? 3 : 1.5}
                cursor="pointer"
                onClick={() => handleSelect(opt.value)}
                tabIndex={0}
                aria-label={opt.label}
              />
              <text x={cx} y={cy + 25} textAnchor="middle" fontSize="10" fill="#374151">{opt.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-2 justify-center">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={`text-xs px-3 py-1 rounded-full border ${positions.includes(opt.value) ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 border-slate-300"}`}
            disabled={positions.length >= cameraCount && !positions.includes(opt.value)}
            type="button"
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
