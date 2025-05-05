
import React from 'react';
import { Truck, MapPin, Route } from 'lucide-react';
import { ActiveService } from '../../types';

interface ServiceInfoProps {
  service: ActiveService;
}

export function ServiceInfo({ service }: ServiceInfoProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-blue-500" />
        <h3 className="text-base font-medium text-slate-800">Información del Servicio</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-1 flex flex-col">
          <span className="text-xs text-slate-500">Custodio</span>
          <span className="font-medium text-sm">{service.custodioName}</span>
        </div>
        
        <div className="col-span-1 flex flex-col">
          <span className="text-xs text-slate-500">ID Rastreo</span>
          <span className="font-medium text-sm">#{service.trackingId}</span>
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="h-3 w-3 text-slate-400" />
          <span className="text-xs text-slate-500">Origen</span>
        </div>
        <p className="text-sm font-medium pl-4">{service.origin}</p>
      </div>

      <div>
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="h-3 w-3 text-slate-400" />
          <span className="text-xs text-slate-500">Destino</span>
        </div>
        <p className="text-sm font-medium pl-4">{service.destination}</p>
      </div>

      <div>
        <div className="flex items-center gap-1 mb-1">
          <Route className="h-3 w-3 text-slate-400" />
          <span className="text-xs text-slate-500">Ubicación Actual</span>
        </div>
        <p className="text-sm font-medium pl-4">{service.currentLocation.address}</p>
      </div>
    </div>
  );
}
