
import React from 'react';
import { ActiveServicesDashboard } from '@/components/performance/dashboard/ActiveServicesDashboard';

export default function ActiveServices() {
  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Servicios Activos</h1>
        <p className="text-muted-foreground">Monitoreo en tiempo real de servicios en tránsito</p>
      </div>
      
      <ActiveServicesDashboard />
    </div>
  );
}
