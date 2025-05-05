
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, ArrowDown, CloudRain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  total: number;
  onTime: number;
  delayed: number;
  riskZone: number;
  roadBlocks: number;
  weatherEvents: number;
}

export function StatsCards({ 
  total, 
  onTime, 
  delayed, 
  riskZone,
  roadBlocks,
  weatherEvents
}: StatsCardsProps) {
  // Ensure all values are non-negative
  const safeOnTime = Math.max(0, onTime);
  const safeDelayed = Math.max(0, delayed);
  const safeRiskZone = Math.max(0, riskZone);
  const safeRoadBlocks = Math.max(0, roadBlocks);
  const safeWeatherEvents = Math.max(0, weatherEvents);
  
  return (
    <div className="grid grid-cols-1 gap-2">
      <Card className="bg-white border p-3 mb-1 shadow-sm">
        <div className="text-center">
          <div className="text-sm font-medium text-slate-500 mb-0.5">Total</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
      </Card>
      
      <div className="grid grid-cols-2 gap-2">
        <Card className={cn(
          "border p-2 shadow-sm",
          "bg-green-50"
        )}>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <div className="text-xs font-medium text-slate-700">En tiempo</div>
            </div>
            <div className="text-xl font-bold text-green-700">{safeOnTime}</div>
          </div>
        </Card>
        
        <Card className={cn(
          "border p-2 shadow-sm",
          "bg-amber-50"
        )}>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-amber-500 mr-1" />
              <div className="text-xs font-medium text-slate-700">Retrasos</div>
            </div>
            <div className="text-xl font-bold text-amber-700">{safeDelayed}</div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Card className={cn(
          "border p-2 shadow-sm",
          "bg-red-50"
        )}>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-1">
              <AlertCircle className="h-3.5 w-3.5 text-red-500 mr-1" />
              <div className="text-xs font-medium text-slate-700">Zonas</div>
            </div>
            <div className="text-lg font-bold text-red-700">{safeRiskZone}</div>
          </div>
        </Card>
        
        <Card className={cn(
          "border p-2 shadow-sm",
          "bg-red-50"
        )}>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-1">
              <ArrowDown className="h-3.5 w-3.5 text-red-500 mr-1" />
              <div className="text-xs font-medium text-slate-700">Bloqueos</div>
            </div>
            <div className="text-lg font-bold text-red-700">{safeRoadBlocks}</div>
          </div>
        </Card>
        
        <Card className={cn(
          "border p-2 shadow-sm",
          "bg-amber-50"
        )}>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-1">
              <CloudRain className="h-3.5 w-3.5 text-amber-500 mr-1" />
              <div className="text-xs font-medium text-slate-700">Clima</div>
            </div>
            <div className="text-lg font-bold text-amber-700">{safeWeatherEvents}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
