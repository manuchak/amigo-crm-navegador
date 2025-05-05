
import React from 'react';
import { Card } from '@/components/ui/card';
import { Check, Clock, AlertTriangle, CloudRain, ArrowDown } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  onTime: number;
  delayed: number;
  riskZone: number;
  roadBlocks?: number;
  weatherEvents?: number;
}

export function StatsCards({ total, onTime, delayed, riskZone, roadBlocks = 0, weatherEvents = 0 }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 mb-3">
      <Card className="p-2 border shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Total</span>
          <span className="text-base font-semibold">{total}</span>
        </div>
      </Card>
      
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-2 border shadow-sm bg-green-50">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-green-700">En Tiempo</span>
              <span className="text-base font-semibold text-green-800">{onTime}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-2 border shadow-sm bg-amber-50">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-amber-700">Retrasos</span>
              <span className="text-base font-semibold text-amber-800">{delayed}</span>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-2 border shadow-sm bg-amber-50">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
              <CloudRain className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-amber-700">Clima</span>
              <span className="text-base font-semibold text-amber-800">{weatherEvents}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-2 border shadow-sm bg-red-50">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
              <ArrowDown className="h-3.5 w-3.5 text-red-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-red-700">Bloqueos</span>
              <span className="text-base font-semibold text-red-800">{roadBlocks}</span>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-2 border shadow-sm bg-red-50">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-red-700">Zonas de Riesgo</span>
            <span className="text-base font-semibold text-red-800">{riskZone}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
