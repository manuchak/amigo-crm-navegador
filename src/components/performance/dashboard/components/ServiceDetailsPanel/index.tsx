
import React from 'react';
import { ActiveService } from '../../types';
import { EmptyState } from './EmptyState';
import { ServiceInfo } from './ServiceInfo';
import { StatusOverview } from './StatusOverview';
import { CargoInfo } from './CargoInfo';
import { RiskIndicators } from './RiskIndicators';

interface ServiceDetailsPanelProps {
  selectedService?: ActiveService;
}

export function ServiceDetailsPanel({ selectedService }: ServiceDetailsPanelProps) {
  if (!selectedService) {
    return (
      <div className="bg-white rounded-xl shadow-sm border h-full overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border h-full overflow-auto">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Detalles del Servicio #{selectedService.id}
        </h3>
        
        <ServiceInfo service={selectedService} />
        <StatusOverview service={selectedService} />
        <CargoInfo service={selectedService} />
        <RiskIndicators service={selectedService} />
      </div>
    </div>
  );
}
