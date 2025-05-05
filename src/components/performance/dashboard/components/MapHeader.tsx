
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CloudRain, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MapHeader() {
  // These could be calculated from actual data in a real implementation
  const stats = {
    totalIncidents: 5,
    roadblocks: 2,
    weatherEvents: 1,
    highRiskAreas: 2
  };

  // Current time
  const currentTime = new Date().toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  return (
    <div className="flex items-center justify-between mb-3 px-0.5">
      <div className="flex items-center">
        <div className="flex items-center text-xs font-medium text-slate-500">
          <Clock className="h-3 w-3 mr-1" />
          <span>Actualizado: {currentTime}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className="text-xs bg-white flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <ArrowDown className="h-3 w-3 text-red-500" />
            <span className="text-slate-600">{stats.roadblocks}</span>
          </div>
          
          <div className="flex gap-0.5">
            <CloudRain className="h-3 w-3 text-amber-500" />
            <span className="text-slate-600">{stats.weatherEvents}</span>
          </div>
          
          <div className="flex gap-0.5">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span className="text-slate-600">{stats.highRiskAreas}</span>
          </div>
          
          <span className="text-xs text-slate-700">
            {stats.totalIncidents} incidentes activos
          </span>
        </Badge>
      </div>
    </div>
  );
}
