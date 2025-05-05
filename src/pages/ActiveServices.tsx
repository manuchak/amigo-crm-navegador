
import React from 'react';
import { ActiveServicesDashboard } from '@/components/performance/dashboard/ActiveServicesDashboard';
import { MapPin } from 'lucide-react';

export default function ActiveServices() {
  return (
    <div className="w-full h-full">
      <div className="mb-2 px-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Servicios Activos</h1>
            <p className="text-sm text-muted-foreground">Monitoreo en tiempo real de servicios en tránsito</p>
          </div>
        </div>
      </div>
      
      <ActiveServicesDashboard />
    </div>
  );
}
