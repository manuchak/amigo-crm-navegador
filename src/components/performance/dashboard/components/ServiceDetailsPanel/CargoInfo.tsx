
import React from 'react';
import { Package } from 'lucide-react';
import { ActiveService } from '../../types';

interface CargoInfoProps {
  service: ActiveService;
}

export function CargoInfo({ service }: CargoInfoProps) {
  // Check if cargo information is available
  const hasCargoInfo = service.cargoType || service.cargoWeight || service.cargoUnits;

  if (!hasCargoInfo) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-green-500" />
        <h3 className="text-base font-medium text-slate-800">Información de Carga</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Tipo</span>
          <span className="text-sm font-medium truncate max-w-[130px]">
            {service.cargoType || 'No especificado'}
            {service.cargoUnits && ` (${service.cargoUnits})`}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Peso total</span>
          <span className="text-sm font-medium truncate max-w-[130px]">
            {service.cargoWeight ? `${service.cargoWeight} kg` : 'No especificado'}
          </span>
        </div>
        
        {service.cargoValue && (
          <div className="flex flex-col col-span-2">
            <span className="text-xs text-slate-500">Valor</span>
            <span className="text-sm font-medium truncate">
              ${service.cargoValue.toLocaleString('es-MX')} MXN
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
