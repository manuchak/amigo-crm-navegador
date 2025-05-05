
import React from 'react';
import { ActiveService } from './types';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, CheckCircle, User, MapPin, CloudRain, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
  service: ActiveService;
  isSelected: boolean;
  onClick: () => void;
}

export function ServiceCard({ service, isSelected, onClick }: ServiceCardProps) {
  // Determine if service is on time
  const isOnTime = service.isOnTime !== undefined 
    ? service.isOnTime 
    : (service.status !== 'delayed' && !(service.delayRisk && service.delayRiskPercent > 50));
  
  // Determine if there are any risks affecting this service
  const hasWeatherRisk = service.weatherEvent && service.weatherEvent.severity > 0;
  const hasRoadBlockage = service.roadBlockage && service.roadBlockage.active;
  const isInRiskZone = service.inRiskZone;
  
  return (
    <div
      className={cn(
        "border rounded-xl p-3 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-3 overflow-hidden",
        isSelected ? "bg-slate-50 border-primary/60" : "bg-white border-slate-100 hover:border-slate-200"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <StatusIcon service={service} />
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="font-medium text-sm truncate">Servicio #{service.id.substring(0, 5)}</p>
          <StatusBadge service={service} />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate">{service.custodioName}</span>
          </div>
          
          <div className="flex items-center gap-1 justify-end">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{service.destination}</span>
          </div>
        </div>
        
        {/* Display risk indicators if present */}
        {(hasWeatherRisk || hasRoadBlockage || isInRiskZone) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hasWeatherRisk && (
              <Badge variant="outline" className="h-5 text-[10px] py-0 bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                <CloudRain className="h-2.5 w-2.5" />
                <span>Clima</span>
                {service.weatherEvent?.causesDelay && <span className="ml-0.5">(retraso)</span>}
              </Badge>
            )}
            
            {hasRoadBlockage && (
              <Badge variant="outline" className="h-5 text-[10px] py-0 bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                <ArrowDown className="h-2.5 w-2.5" />
                <span>Bloqueo</span>
                {service.roadBlockage?.causesDelay && <span className="ml-0.5">(retraso)</span>}
              </Badge>
            )}
            
            {isInRiskZone && (
              <Badge variant="outline" className="h-5 text-[10px] py-0 bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                <AlertTriangle className="h-2.5 w-2.5" />
                <span>Zona</span>
              </Badge>
            )}
            
            {service.delayRisk && service.delayRiskPercent > 30 && (
              <Badge variant="outline" className="h-5 text-[10px] py-0 bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                <span>Retraso {service.delayRiskPercent}%</span>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ service }: { service: ActiveService }) {
  const baseClasses = "h-9 w-9 rounded-full flex items-center justify-center";
  
  // Determine if service is on time
  const isOnTime = service.isOnTime !== undefined 
    ? service.isOnTime 
    : (service.status !== 'delayed' && !(service.delayRisk && service.delayRiskPercent > 50));
  
  // Show appropriate risk icon based on priority
  if (service.roadBlockage && service.roadBlockage.active) {
    return (
      <div className={`${baseClasses} bg-red-50`}>
        <div className="h-7 w-7 rounded-full bg-red-500 flex items-center justify-center">
          <ArrowDown className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }
  
  if (service.weatherEvent && service.weatherEvent.severity > 1) {
    return (
      <div className={`${baseClasses} bg-amber-50`}>
        <div className="h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center">
          <CloudRain className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }
  
  if (service.inRiskZone) {
    return (
      <div className={`${baseClasses} bg-red-50`}>
        <div className="h-7 w-7 rounded-full bg-red-500 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }
  
  if (service.delayRisk && service.delayRiskPercent > 50) {
    return (
      <div className={`${baseClasses} bg-amber-50`}>
        <div className="h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center">
          <Clock className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }
  
  // Default to on-time status icon
  return (
    <div className={`${baseClasses} bg-green-50`}>
      <div className="h-7 w-7 rounded-full bg-green-500 flex items-center justify-center">
        <CheckCircle className="h-4 w-4 text-white" />
      </div>
    </div>
  );
}

function StatusBadge({ service }: { service: ActiveService }) {
  // Determine if service is on time
  const isOnTime = service.isOnTime !== undefined 
    ? service.isOnTime 
    : (service.status !== 'delayed' && !(service.delayRisk && service.delayRiskPercent > 50));
  
  // Display risk status badges with priority
  if (service.roadBlockage && service.roadBlockage.active) {
    return (
      <Badge variant="outline" className="h-5 text-xs bg-red-50 text-red-700 border-red-200">
        {isOnTime ? "En tiempo (Bloqueo)" : "Retraso por bloqueo"}
      </Badge>
    );
  }
  
  if (service.weatherEvent && service.weatherEvent.severity > 1) {
    return (
      <Badge variant="outline" className="h-5 text-xs bg-amber-50 text-amber-700 border-amber-200">
        {isOnTime ? "En tiempo (Clima)" : "Retraso por clima"}
      </Badge>
    );
  }
  
  if (service.inRiskZone) {
    return (
      <Badge variant="outline" className="h-5 text-xs bg-red-50 text-red-700 border-red-200">
        {isOnTime ? "En tiempo (Zona riesgo)" : "En zona de riesgo"}
      </Badge>
    );
  }
  
  if (service.delayRisk && service.delayRiskPercent > 50) {
    return (
      <Badge variant="outline" className="h-5 text-xs bg-amber-50 text-amber-700 border-amber-200">
        {isOnTime ? "En tiempo (Posible retraso)" : "Posible retraso"}
      </Badge>
    );
  }
  
  // Default status badge
  return (
    <Badge variant="outline" className="h-5 text-xs bg-green-50 text-green-700 border-green-200">
      {isOnTime ? "En tiempo" : "Con retraso"}
    </Badge>
  );
}
