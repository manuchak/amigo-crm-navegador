
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, User, Clock, AlertTriangle, Check } from 'lucide-react';
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
    <div className="flex-grow overflow-hidden flex flex-col mt-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-medium text-slate-800">Servicios Activos</h3>
        <Badge variant="secondary" className="text-xs font-medium bg-slate-100 text-slate-700">{services.length}</Badge>
      </div>
      
      <div className="flex-grow overflow-auto rounded-lg border bg-white mb-2 shadow-sm">
        <div className="divide-y">
          {displayedServices.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedServiceId(service.id)}
              className={cn(
                "w-full text-left p-3 transition-colors flex items-center gap-3",
                service.id === selectedServiceId
                  ? "bg-slate-50 border-l-2 border-l-primary"
                  : "hover:bg-slate-50 border-l-2 border-l-transparent"
              )}
            >
              <StatusIcon service={service} />
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">
                    Servicio #{service.id.substring(0, 5)}
                  </span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {service.eta}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500 truncate">
                    {service.custodioName}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {services.length > 4 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs border shadow-sm"
          onClick={() => setShowAllServices(!showAllServices)}
        >
          {showAllServices ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 mr-1" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 mr-1" />
              Mostrar todos ({services.length})
            </>
          )}
        </Button>
      )}
    </div>
  );
}

function StatusIcon({ service }: { service: ActiveService }) {
  const baseClasses = "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0";
  
  if (service.inRiskZone) {
    return (
      <div className={`${baseClasses} bg-red-50`}>
        <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
          <AlertTriangle className="h-3 w-3 text-white" />
        </div>
      </div>
    );
  }
  
  if (service.delayRisk && service.delayRiskPercent > 50) {
    return (
      <div className={`${baseClasses} bg-amber-50`}>
        <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
          <Clock className="h-3 w-3 text-white" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${baseClasses} bg-green-50`}>
      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
        <Check className="h-3 w-3 text-white" />
      </div>
    </div>
  );
}

