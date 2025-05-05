
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CloudRain, ArrowDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveService } from '../../types';
import { ProgressBar } from './ProgressBar';

interface StatusOverviewProps {
  service: ActiveService;
}

export function StatusOverview({ service }: StatusOverviewProps) {
  // Determine the highest priority status
  let statusIcon = <div className="w-2 h-2 rounded-full bg-green-500" />;
  let statusText = "En tiempo";
  
  if (service.roadBlockage && service.roadBlockage.active) {
    statusIcon = <ArrowDown className="h-4 w-4 text-red-500" />;
    statusText = "Bloqueo vial";
  } else if (service.weatherEvent && service.weatherEvent.severity > 0) {
    statusIcon = <CloudRain className="h-4 w-4 text-amber-500" />;
    statusText = "Alerta climática";
  } else if (service.inRiskZone) {
    statusIcon = <AlertCircle className="h-4 w-4 text-red-500" />;
    statusText = "Zona de riesgo";
  } else if (service.delayRisk && service.delayRiskPercent > 50) {
    statusIcon = <Clock className="h-4 w-4 text-amber-500" />;
    statusText = "Posible retraso";
  }
  
  // Calculate delivery progress (simplified for demonstration)
  const progress = service.progress || 65; // Default to 65% if not specified
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className="text-sm font-medium">{statusText}</span>
        </div>
        <Badge 
          className={cn(
            "text-xs font-medium",
            service.roadBlockage && service.roadBlockage.active ? "bg-red-500" :
            service.weatherEvent && service.weatherEvent.severity > 0 ? "bg-amber-500" :
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
      
      {/* Progress bar indicating delivery progress */}
      <ProgressBar 
        progress={progress}
        isDelayed={service.delayRisk && service.delayRiskPercent > 50}
        hasBlockage={service.roadBlockage && service.roadBlockage.active}
      />
      
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
            (service.delayRisk && service.delayRiskPercent > 50) || 
            (service.roadBlockage && service.roadBlockage.active) || 
            (service.weatherEvent && service.weatherEvent.severity > 0) 
              ? "text-red-600" 
              : ""
          )}>
            {service.adjustedEta || service.eta}
          </span>
        </div>
      </div>
    </div>
  );
}
