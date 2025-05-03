
import React from 'react';
import { ActiveService } from '../types';
import { MapContainer } from './MapContainer';
import { MapLegend } from './MapLegend';
import { MapErrorDisplay } from './MapErrorDisplay';

interface ActiveServicesMapProps {
  services: ActiveService[];
  selectedServiceId?: string;
  onServiceSelect: (id: string) => void;
}

export function ActiveServicesMap({ services, selectedServiceId, onServiceSelect }: ActiveServicesMapProps) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border shadow-sm bg-card">
      <MapContainer 
        services={services} 
        selectedServiceId={selectedServiceId} 
        onServiceSelect={onServiceSelect} 
      />
      <MapLegend />
    </div>
  );
}
