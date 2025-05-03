
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
    <div className="rounded-xl bg-slate-50/70 p-4 mb-5 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-slate-500 mb-1">Estado del servicio</p>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              service.inRiskZone ? "bg-red-500" : 
              service.delayRisk && service.delayRiskPercent > 50 ? "bg-amber-500" : 
              "bg-green-500"
            )} />
            <span className="font-semibold">
              {service.inRiskZone ? "Zona de riesgo" : 
               service.delayRisk && service.delayRiskPercent > 50 ? "Posible retraso" : 
               "En tiempo"}
            </span>
          </div>
        </div>
        <Badge 
          className={cn(
            "uppercase text-xs font-bold",
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
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs text-slate-500">ETA Original</p>
          <p className="font-bold mt-1 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
            {service.etaOriginal}
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs text-slate-500">ETA Actual</p>
          <p className={cn(
            "font-bold mt-1 flex items-center",
            service.delayRisk && service.delayRiskPercent > 50 ? "text-amber-600" : ""
          )}>
            <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
            {service.eta}
          </p>
        </div>
      </div>
    </div>
  );
}
