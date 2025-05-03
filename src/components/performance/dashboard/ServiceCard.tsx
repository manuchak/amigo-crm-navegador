
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ActiveService } from './types';
import { cn } from '@/lib/utils';
import { MapPin, Package, Clock, AlertCircle, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
  service: ActiveService;
  isSelected: boolean;
  onClick: () => void;
}

export function ServiceCard({ service, isSelected, onClick }: ServiceCardProps) {
  const isDelayed = service.delayRiskPercent > 50;
  const isDangerZone = service.inRiskZone;
  
  return (
    <Card 
      className={cn(
        "mb-4 border overflow-hidden transition-all cursor-pointer group hover:border-primary",
        isSelected ? "ring-2 ring-primary border-primary" : "",
        isDangerZone ? "border-red-300 bg-red-50" : 
        isDelayed ? "border-amber-300 bg-amber-50" : ""
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg flex items-center">
            #{service.id}
          </div>
          <div className="flex items-center">
            <div className={cn(
              "w-3 h-3 rounded-full mr-2",
              isDangerZone ? "bg-red-500" : 
              isDelayed ? "bg-amber-500" : "bg-green-500"
            )} />
            <span className="text-sm text-muted-foreground">
              {service.custodioName}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium truncate">{service.destination}</span>
        </div>
        
        {service.cargo && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-muted-foreground">
              {service.cargo.count} {service.cargo.type}, {service.cargo.weight}kg
            </span>
          </div>
        )}
        
        {service.trackingId && (
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-muted-foreground">
              ID: #{service.trackingId}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-semibold">ETA {service.eta}</span>
          </div>
          
          {/* Risk indicators */}
          <div className="flex gap-1">
            {service.delayRisk && (
              <Badge variant="outline" className={cn(
                "text-xs border",
                service.delayRiskPercent > 50 ? "border-amber-300 bg-amber-50 text-amber-700" : ""
              )}>
                {service.delayRiskPercent}% retraso
              </Badge>
            )}
            
            {service.inRiskZone && (
              <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700 text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Zona de riesgo
              </Badge>
            )}
          </div>
        </div>
        
        {/* Mini Map Preview */}
        <div className="w-full h-20 bg-gray-100 rounded-md overflow-hidden relative">
          <img 
            src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+16a34a(${service.currentLocation.coordinates[0]},${service.currentLocation.coordinates[1]})/${service.currentLocation.coordinates[0]},${service.currentLocation.coordinates[1]},14,0/300x100@2x?access_token=pk.eyJ1IjoibGVvbmFyZG9wY2UiLCJhIjoiY2tqZHc2NjZ5MGdmejJ5cWp4Z2NmbWF6eSJ9.Z_BwEDFyO7N_x-I-afk1aQ`}
            alt="Location preview"
            className="w-full h-full object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}
