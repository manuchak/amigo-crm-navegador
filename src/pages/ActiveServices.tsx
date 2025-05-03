
import React from 'react';
import { ActiveServicesDashboard } from '@/components/performance/dashboard/ActiveServicesDashboard';
import { MapPin } from 'lucide-react';

export default function ActiveServices() {
  return (
    <div className="w-full px-0 md:px-1 py-2">
      <div className="mb-3">
        <div className="flex items-center gap-3 mb-1 px-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Servicios Activos</h1>
            <p className="text-muted-foreground">Monitoreo en tiempo real de servicios en tránsito</p>
          </div>
        </div>
      </div>
      
      <ActiveServicesDashboard />
    </div>
  );
}
