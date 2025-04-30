
import React from 'react';
import { ServiciosAlertas } from '../ServiciosAlertas';
import { ClienteAlerta } from '../../services/servicios';

interface AlertsSectionProps {
  alertas: ClienteAlerta[];
  isLoading: boolean;
}

export function AlertsSection({ alertas, isLoading }: AlertsSectionProps) {
  return (
    <div className="animate-fade-in animate-delay-200 duration-300">
      <div className="h-[360px]">
        <ServiciosAlertas 
          alertas={alertas || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
