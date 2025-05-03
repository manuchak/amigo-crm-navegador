
import React from 'react';
import { ActiveServicesDashboard } from '@/components/performance/dashboard/ActiveServicesDashboard';
import { MapPin } from 'lucide-react';

export default function ActiveServices() {
  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
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
