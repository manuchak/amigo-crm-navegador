
import React from 'react';

interface VehicleInfoProps {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
}

const VehicleInfo: React.FC<VehicleInfoProps> = ({ brand, model, year }) => {
  if (brand) {
    return (
      <div className="text-xs">
        <span className="text-slate-800">
          {brand} {model} {year}
        </span>
      </div>
    );
  }
  
  return <span className="text-xs text-slate-400">No registrado</span>;
};

export default VehicleInfo;
