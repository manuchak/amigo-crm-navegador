
import React from 'react';
import { ActiveService } from './types';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, Check, User, MapPin } from 'lucide-react';
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
      </div>
    </div>
  );
}

function StatusIcon({ service }: { service: ActiveService }) {
  const baseClasses = "h-9 w-9 rounded-full flex items-center justify-center";
  
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
  
  return (
    <div className={`${baseClasses} bg-green-50`}>
      <div className="h-7 w-7 rounded-full bg-green-500 flex items-center justify-center">
        <Check className="h-4 w-4 text-white" />
      </div>
    </div>
  );
}

function StatusBadge({ service }: { service: ActiveService }) {
  if (service.inRiskZone) {
    return (
      <Badge variant="outline" className="h-5 text-xs bg-red-50 text-red-700 border-red-200">
        Zona riesgo
      </Badge>
    );
  }
  
  if (service.delayRisk && service.delayRiskPercent > 50) {
    return (
      <Badge variant="outline" className="h-5 text-xs bg-amber-50 text-amber-700 border-amber-200">
        Posible retraso
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="h-5 text-xs bg-green-50 text-green-700 border-green-200">
      En tiempo
    </Badge>
  );
}

