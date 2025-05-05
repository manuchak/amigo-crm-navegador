
import React from 'react';
import { Package } from 'lucide-react';
import { ActiveService } from '../../types';

interface CargoInfoProps {
  service: ActiveService;
}

export function CargoInfo({ service }: CargoInfoProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-green-500" />
        <h3 className="text-base font-medium text-slate-800">Información de Carga</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Cantidad</span>
          <span className="text-sm font-medium">{service.cargo.count} {service.cargo.type}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Peso total</span>
          <span className="text-sm font-medium">{service.cargo.weight} kg</span>
        </div>
      </div>
    </div>
  );
}
