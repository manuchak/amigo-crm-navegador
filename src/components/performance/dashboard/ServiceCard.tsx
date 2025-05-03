
import React from 'react';
import { ActiveService } from './types';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle, Timer, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
  service: ActiveService;
  isSelected: boolean;
  onClick: () => void;
}

export function ServiceCard({ service, isSelected, onClick }: ServiceCardProps) {
  return (
    <div
      className={cn(
        "border rounded-xl p-3 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-3 overflow-hidden",
        isSelected ? "bg-slate-50 border-primary/60" : "bg-white border-slate-100 hover:border-slate-200"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            service.inRiskZone
              ? "bg-red-50"
              : service.delayRisk && service.delayRiskPercent > 50
              ? "bg-amber-50"
              : "bg-green-50"
          )}
        >
          <div
            className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center",
              service.inRiskZone
                ? "bg-red-500"
                : service.delayRisk && service.delayRiskPercent > 50
                ? "bg-amber-500"
                : "bg-green-500"
            )}
          >
            {service.inRiskZone ? (
              <AlertCircle className="h-3.5 w-3.5 text-white" />
            ) : service.delayRisk && service.delayRiskPercent > 50 ? (
              <Timer className="h-3.5 w-3.5 text-white" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-white" />
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">Servicio #{service.id}</p>
          <Badge 
            variant="outline" 
            className={cn(
              "h-5 text-xs font-medium",
              service.inRiskZone 
                ? "bg-red-50 text-red-700 border-red-200" 
                : service.delayRisk && service.delayRiskPercent > 50
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-green-50 text-green-700 border-green-200"
            )}
          >
            {service.inRiskZone 
              ? "Zona riesgo" 
              : service.delayRisk && service.delayRiskPercent > 50 
              ? "Posible retraso" 
              : "En tiempo"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
          <div className="flex items-center gap-1 truncate">
            <Truck className="h-3 w-3" />
            <span className="truncate">{service.custodioName}</span>
          </div>
          <div className="flex-shrink-0 font-medium">
            {service.eta}
          </div>
        </div>
      </div>
    </div>
  );
}
