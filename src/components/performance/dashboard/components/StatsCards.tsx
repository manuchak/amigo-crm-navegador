
import React from 'react';
import { AlertTriangle, ArrowDown, CloudRain, Clock, CheckCircle } from 'lucide-react';
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
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className={cn(
        "rounded-lg border p-2.5 bg-white/90 backdrop-blur-sm shadow-sm flex flex-col",
        "border-green-100"
      )}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="h-6 w-6 rounded-full bg-green-50/80 flex items-center justify-center">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          </div>
          <span className="text-xs font-medium text-slate-600">En tiempo</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">{onTime}</span>
          <span className="text-[10px] text-slate-500">{Math.round((onTime / total) * 100)}%</span>
        </div>
      </div>
      
      <div className={cn(
        "rounded-lg border p-2.5 bg-white/90 backdrop-blur-sm shadow-sm flex flex-col",
        "border-red-100"
      )}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="h-6 w-6 rounded-full bg-red-50/80 flex items-center justify-center">
            <Clock className="h-3.5 w-3.5 text-red-600" />
          </div>
          <span className="text-xs font-medium text-slate-600">Retrasos</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-red-600">{delayed}</span>
          <span className="text-[10px] text-slate-500">{Math.round((delayed / total) * 100)}%</span>
        </div>
      </div>
      
      <div className={cn(
        "rounded-lg border p-2.5 bg-white/90 backdrop-blur-sm shadow-sm flex flex-col",
        "border-red-100"
      )}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="h-6 w-6 rounded-full bg-red-50/80 flex items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
          </div>
          <span className="text-xs font-medium text-slate-600">Zonas riesgo</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-red-600">{riskZone}</span>
          <span className="text-[10px] text-slate-500">{total > 0 ? Math.round((riskZone / total) * 100) : 0}%</span>
        </div>
      </div>
      
      <div className={cn(
        "rounded-lg border p-2.5 bg-white/90 backdrop-blur-sm shadow-sm",
        "border-slate-100"
      )}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-medium text-slate-600">Incidentes</span>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <ArrowDown className="h-3 w-3 text-red-500" />
            <span className="text-xs font-medium">{roadBlocks}</span>
          </div>
          <div className="flex items-center gap-1">
            <CloudRain className="h-3 w-3 text-amber-500" />
            <span className="text-xs font-medium">{weatherEvents}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
