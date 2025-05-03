
import React from 'react';
import { Truck, MapPin, Route } from 'lucide-react';
import { ActiveService } from '../../types';

interface ServiceInfoProps {
  service: ActiveService;
}

export function ServiceInfo({ service }: ServiceInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 mb-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <Truck className="h-4 w-4 text-blue-500" />
        </div>
        <h3 className="font-semibold">Información del Servicio</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500">Custodio</p>
          <p className="mt-1 font-medium">{service.custodioName}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500">ID Rastreo</p>
          <p className="mt-1 font-medium">#{service.trackingId}</p>
        </div>
        <div className="col-span-2 bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Origen
          </p>
          <p className="mt-1 font-medium">{service.origin}</p>
        </div>
        <div className="col-span-2 bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Destino
          </p>
          <p className="mt-1 font-medium">{service.destination}</p>
        </div>
        <div className="col-span-2 bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Route className="h-3 w-3" /> Ubicación Actual
          </p>
          <p className="mt-1 font-medium">{service.currentLocation.address}</p>
        </div>
      </div>
    </div>
  );
}
