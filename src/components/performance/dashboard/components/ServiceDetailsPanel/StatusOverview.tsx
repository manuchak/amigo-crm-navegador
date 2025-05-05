
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CloudRain, ArrowDown, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveService } from '../../types';
import { ProgressBar } from './ProgressBar';

interface StatusOverviewProps {
  service: ActiveService;
}

export function StatusOverview({ service }: StatusOverviewProps) {
  // Determine if service is on time based on status and delayRisk
  const isOnTime = service.isOnTime !== undefined 
    ? service.isOnTime 
    : (service.status !== 'delayed' && !(service.delayRisk && service.delayRiskPercent > 50));
  
  // Primary status icon and text based on on-time status
  let primaryStatusIcon = isOnTime 
    ? <CheckCircle className="h-4 w-4 text-green-500" />
    : <Clock className="h-4 w-4 text-amber-500" />;
  
  let primaryStatusText = isOnTime ? "En tiempo" : "Retraso en tránsito";
  
  // Calculate active risk factors
  const hasRoadBlockage = service.roadBlockage && service.roadBlockage.active;
  const hasWeatherEvent = service.weatherEvent && service.weatherEvent.severity > 0;
  const isInRiskZone = service.inRiskZone;
  
  // Calculate delivery progress
  const progress = service.progress || 65; // Default to 65% if not specified
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {primaryStatusIcon}
          <span className="text-sm font-medium">{primaryStatusText}</span>
        </div>
        <Badge 
          className={cn(
            "text-xs font-medium",
            !isOnTime ? "bg-amber-500" : "bg-green-500"
          )}
        >
          {service.status === 'delayed' ? 'Con retraso' : 
           service.status === 'completed' ? 'Completado' : 
           isOnTime ? 'En tránsito (en tiempo)' : 'En tránsito (demorado)'}
        </Badge>
      </div>
      
      {/* Progress bar indicating delivery progress */}
      <ProgressBar 
        progress={progress}
        isDelayed={!isOnTime}
        hasBlockage={hasRoadBlockage}
      />
      
      {/* Risk factors display */}
      {(hasRoadBlockage || hasWeatherEvent || isInRiskZone) && (
        <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
          {hasRoadBlockage && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs flex items-center gap-1">
              <ArrowDown className="h-3 w-3" />
              <span>Bloqueo</span>
              {service.roadBlockage?.causesDelay ? " (causa retraso)" : ""}
            </Badge>
          )}
          
          {hasWeatherEvent && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs flex items-center gap-1">
              <CloudRain className="h-3 w-3" />
              <span>Clima</span>
              {service.weatherEvent?.causesDelay ? " (causa retraso)" : ""}
            </Badge>
          )}
          
          {isInRiskZone && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>Zona riesgo</span>
            </Badge>
          )}
        </div>
      )}
      
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
            !isOnTime ? "text-red-600" : ""
          )}>
            {service.adjustedEta || service.eta}
          </span>
        </div>
      </div>
    </div>
  );
}
