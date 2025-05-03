
import React from 'react';
import { ActiveServicesDashboard } from '@/components/performance/dashboard/ActiveServicesDashboard';
import { MapPin } from 'lucide-react';

export default function ActiveServices() {
  return (
    <div className="w-full px-2 md:px-4 py-4">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
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
