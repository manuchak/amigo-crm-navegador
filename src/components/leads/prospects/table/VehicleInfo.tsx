
import React from 'react';

interface VehicleInfoProps {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
}

const VehicleInfo: React.FC<VehicleInfoProps> = ({ brand, model, year }) => {
  if (brand) {
    return (
      <span>
        {brand} {model} {year}
      </span>
    );
  }
  
  return <span className="text-slate-400">No registrado</span>;
};

export default VehicleInfo;
