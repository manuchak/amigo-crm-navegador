
import React from 'react';
import { ActiveServicesDashboard } from '@/components/performance/dashboard/ActiveServicesDashboard';
import { MapPin, ShieldAlert } from 'lucide-react';

export default function ActiveServices() {
  return (
    <div className="w-full h-full pt-16">
      <div className="mb-2 px-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Monitoreo de Cadena de Suministro</h1>
            <p className="text-sm text-muted-foreground">Servicios activos e incidentes en tiempo real</p>
          </div>
        </div>
      </div>
      
      <ActiveServicesDashboard />
    </div>
  );
}
