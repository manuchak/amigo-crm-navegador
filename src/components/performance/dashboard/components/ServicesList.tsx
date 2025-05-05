
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, AlertTriangle, CloudRain, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveService } from '../types';
import { ServiceCard } from '../ServiceCard';

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
  // Count services by risk category
  const riskZoneCount = services.filter(s => s.inRiskZone).length;
  const weatherRiskCount = services.filter(s => s.weatherEvent && s.weatherEvent.severity > 0).length;
  const roadBlockCount = services.filter(s => s.roadBlockage && s.roadBlockage.active).length;
  const delayRiskCount = services.filter(s => s.delayRisk && s.delayRiskPercent > 30).length;

  return (
    <div className="flex-grow overflow-hidden flex flex-col mt-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-medium text-slate-800">Servicios Activos</h3>
        <Badge variant="secondary" className="text-xs font-medium bg-slate-100 text-slate-700">{services.length}</Badge>
      </div>
      
      {/* Risk summary badges */}
      <div className="flex flex-wrap gap-1.5 mb-3 px-1">
        {roadBlockCount > 0 && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs flex items-center">
            <ArrowDown className="h-3 w-3 mr-1" />
            Bloqueos: {roadBlockCount}
          </Badge>
        )}
        
        {weatherRiskCount > 0 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs flex items-center">
            <CloudRain className="h-3 w-3 mr-1" />
            Clima: {weatherRiskCount}
          </Badge>
        )}
        
        {riskZoneCount > 0 && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Zonas riesgo: {riskZoneCount}
          </Badge>
        )}
        
        {delayRiskCount > 0 && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
            Retrasos: {delayRiskCount}
          </Badge>
        )}
      </div>
      
      <div className="flex-grow overflow-auto rounded-lg border bg-white mb-2 shadow-sm">
        <div className="divide-y">
          {/* Sort to show high-risk services first */}
          {displayedServices
            .sort((a, b) => {
              // Prioritize services with road blockages
              const aHasRoadBlock = a.roadBlockage && a.roadBlockage.active;
              const bHasRoadBlock = b.roadBlockage && b.roadBlockage.active;
              if (aHasRoadBlock && !bHasRoadBlock) return -1;
              if (!aHasRoadBlock && bHasRoadBlock) return 1;
              
              // Then weather events
              const aHasWeather = a.weatherEvent && a.weatherEvent.severity > 0;
              const bHasWeather = b.weatherEvent && b.weatherEvent.severity > 0;
              if (aHasWeather && !bHasWeather) return -1;
              if (!aHasWeather && bHasWeather) return 1;
              
              // Then risk zones
              if (a.inRiskZone && !b.inRiskZone) return -1;
              if (!a.inRiskZone && b.inRiskZone) return 1;
              
              // Then delay risk
              const aDelayRisk = a.delayRisk && a.delayRiskPercent > 50;
              const bDelayRisk = b.delayRisk && b.delayRiskPercent > 50;
              if (aDelayRisk && !bDelayRisk) return -1;
              if (!aDelayRisk && bDelayRisk) return 1;
              
              return 0;
            })
            .map((service) => (
              <div
                key={service.id}
                className={cn(
                  "p-2",
                  service.id === selectedServiceId ? "bg-slate-50" : ""
                )}
              >
                <ServiceCard
                  service={service}
                  isSelected={service.id === selectedServiceId}
                  onClick={() => setSelectedServiceId(service.id)}
                />
              </div>
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
