
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveService } from '../types';

interface ServicesListProps {
  services: ActiveService[];
  displayedServices: ActiveService[];
  selectedServiceId?: string;
  setSelectedServiceId: (id: string) => void;
  showAllServices: boolean;
  setShowAllServices: (show: boolean) => void;
}

export function ServicesList({
  services,
  displayedServices,
  selectedServiceId,
  setSelectedServiceId,
  showAllServices,
  setShowAllServices,
}: ServicesListProps) {
  return (
    <div className="flex-grow overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-medium">Servicios Activos</h3>
        <Badge variant="secondary" className="text-xs">{services.length}</Badge>
      </div>
      
      <div className="flex-grow overflow-auto rounded-lg border bg-white mb-1">
        <div className="divide-y">
          {displayedServices.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedServiceId(service.id)}
              className={cn(
                "w-full text-left p-1.5 transition-colors flex flex-col",
                service.id === selectedServiceId
                  ? "bg-primary/5 border-l-2 border-l-primary"
                  : "hover:bg-muted/30"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs truncate">
                  Servicio #{service.id.substring(0, 5)}
                </span>
                {getRiskBadge(service)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {service.custodio}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {services.length > 4 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs border"
          onClick={() => setShowAllServices(!showAllServices)}
        >
          {showAllServices ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              Mostrar todos ({services.length})
            </>
          )}
        </Button>
      )}
    </div>
  );
}

function getRiskBadge(service: ActiveService) {
  if (service.inRiskZone) {
    return <Badge variant="destructive" className="text-[10px]">Zona riesgo</Badge>;
  }
  
  if (service.delayRisk && service.delayRiskPercent > 50) {
    return <Badge variant="warning" className="text-[10px]">Posible retraso</Badge>;
  }
  
  return <Badge variant="success" className="text-[10px]">En tiempo</Badge>;
}
