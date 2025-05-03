
import React from 'react';
import { Package } from 'lucide-react';
import { ActiveService } from '../../types';

interface CargoInfoProps {
  service: ActiveService;
}

export function CargoInfo({ service }: CargoInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
          <Package className="h-4 w-4 text-green-500" />
        </div>
        <h3 className="font-semibold">Información de Carga</h3>
      </div>
      <div className="bg-slate-50 p-3 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-1.5">
            <Package className="h-4 w-4 text-slate-500" />
            <span>Cantidad</span>
          </span>
          <span className="font-semibold">{service.cargo.count} {service.cargo.type}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Peso total:</span>
          <span className="font-semibold">{service.cargo.weight} kg</span>
        </div>
      </div>
    </div>
  );
}
