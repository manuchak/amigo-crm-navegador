
import React from 'react';
import { ActiveService } from './types';
import { AlertTriangle, ArrowDown, CloudRain, Clock, MapPin, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
  service: ActiveService;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ServiceCard({ service, isSelected, onClick }: ServiceCardProps) {
  // Determine if service has any active risk factors
  const hasRoadBlockage = service.roadBlockage && service.roadBlockage.active;
  const hasWeatherEvent = service.weatherEvent && service.weatherEvent.severity > 0;
  const hasRiskZone = service.inRiskZone;
  const hasRiskFactor = hasRoadBlockage || hasWeatherEvent || hasRiskZone;
  
  // Determine if service is on time, either from explicit flag or by status and delay risk
  const isOnTime = service.isOnTime !== undefined 
    ? service.isOnTime 
    : (service.status !== 'delayed' && !(service.delayRisk && service.delayRiskPercent > 50));
  
  // Generate main service info
  const serviceId = service.id.replace('SVC-', '');
  const progress = service.progress || 50;
  
  // Background color based on selection and risks
  let bgColorClass = 'bg-white hover:bg-slate-50';
  let borderColorClass = 'border-slate-200';
  
  if (isSelected) {
    bgColorClass = 'bg-blue-50/80';
    borderColorClass = 'border-blue-200';
  } else if (!isOnTime) {
    bgColorClass = 'bg-amber-50/30 hover:bg-amber-50/50';
    borderColorClass = 'border-amber-100';
  } else if (hasRiskFactor) {
    bgColorClass = 'bg-red-50/20 hover:bg-red-50/30';
    borderColorClass = 'border-red-100';
  }
  
  return (
    <div 
      className={cn(
        "rounded-lg border shadow-sm p-2 cursor-pointer transition-colors",
        bgColorClass, borderColorClass,
        isSelected ? 'ring-1 ring-blue-300' : ''
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 bg-primary-foreground rounded-md">
            <span className="text-xs font-bold text-primary">{serviceId}</span>
          </div>
          <div className="flex flex-col max-w-[120px]">
            <span className="text-xs font-medium truncate">{service.custodioName}</span>
            <span className="text-[10px] text-slate-500 truncate">{service.vehicleType || 'Vehículo'}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          {isOnTime ? (
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 text-[10px] px-1.5 py-0">
              En tiempo
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] px-1.5 py-0">
              Retraso
            </Badge>
          )}
        </div>
      </div>

      <div className="mb-1.5">
        <div className="flex items-center gap-1 mb-0.5">
          <MapPin className="h-3 w-3 text-slate-400" />
          <span className="text-[10px] text-slate-500">Destino</span>
        </div>
        <p className="text-xs pl-4 truncate max-w-[210px]">{service.destination}</p>
      </div>
      
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-400" />
          <span className="text-[10px] text-slate-500">ETA: </span>
          <span className={cn(
            "text-xs font-medium",
            !isOnTime ? "text-red-600" : ""
          )}>
            {service.adjustedEta || service.eta}
          </span>
        </div>
        
        {hasRiskFactor && (
          <div className="flex items-center gap-1">
            {hasRoadBlockage && <ArrowDown className="h-3 w-3 text-red-500" />}
            {hasWeatherEvent && <CloudRain className="h-3 w-3 text-amber-500" />}
            {hasRiskZone && <AlertTriangle className="h-3 w-3 text-red-500" />}
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
        <div 
          className={cn(
            "h-1.5 rounded-full",
            isOnTime ? "bg-green-500" : "bg-amber-500"
          )} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-500">Progreso: {progress}%</span>
        
        {!isOnTime && service.estimatedDelayMinutes && (
          <span className="text-[10px] text-red-500">
            +{service.estimatedDelayMinutes} min
          </span>
        )}
      </div>
    </div>
  );
}
