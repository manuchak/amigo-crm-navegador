
import React from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ActiveService } from '../types';
import { ServiceCard } from '../ServiceCard';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  setShowAllServices
}: ServicesListProps) {
  return (
    <Card className="border shadow-sm flex-grow overflow-hidden flex flex-col mt-3 rounded-lg bg-white/90 backdrop-blur-sm">
      <div className="p-2 pb-1.5 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-700">Servicios Activos</h3>
          <span className="text-xs text-slate-500">{services.length} total</span>
        </div>
      </div>
      
      <ScrollArea className="flex-grow px-2 py-2">
        <div className="space-y-2">
          {displayedServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={service.id === selectedServiceId}
              onClick={() => setSelectedServiceId(service.id)}
            />
          ))}
        </div>
      </ScrollArea>
      
      {services.length > 4 && (
        <div 
          className="p-2 border-t text-center cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setShowAllServices(!showAllServices)}
        >
          <div className="flex items-center justify-center gap-1 text-xs text-slate-600">
            {showAllServices ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Mostrar menos</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Mostrar todos ({services.length})</span>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
