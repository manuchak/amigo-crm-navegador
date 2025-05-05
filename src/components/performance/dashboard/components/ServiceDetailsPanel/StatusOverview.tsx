
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveService } from '../../types';

interface StatusOverviewProps {
  service: ActiveService;
}

export function StatusOverview({ service }: StatusOverviewProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            service.inRiskZone ? "bg-red-500" : 
            service.delayRisk && service.delayRiskPercent > 50 ? "bg-amber-500" : 
            "bg-green-500"
          )} />
          <span className="text-sm font-medium">
            {service.inRiskZone ? "Zona de riesgo" : 
             service.delayRisk && service.delayRiskPercent > 50 ? "Posible retraso" : 
             "En tiempo"}
          </span>
        </div>
        <Badge 
          className={cn(
            "text-xs font-medium",
            service.inRiskZone ? "bg-red-500" :
            service.delayRisk && service.delayRiskPercent > 50 ? "bg-amber-500" :
            "bg-green-500"
          )}
        >
          {service.status === 'delayed' ? 'Con retraso' : 
           service.status === 'completed' ? 'Completado' : 
           'En tránsito'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-500">ETA Original</span>
          </div>
          <span className="text-sm font-medium pl-4">{service.etaOriginal}</span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-500">ETA Actual</span>
          </div>
          <span className={cn(
            "text-sm font-medium pl-4",
            service.delayRisk && service.delayRiskPercent > 50 ? "text-amber-600" : ""
          )}>
            {service.eta}
          </span>
        </div>
      </div>
    </div>
  );
}
