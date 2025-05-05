
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  onTime: number;
  delayed: number;
  riskZone: number;
}

export function StatsCards({ total, onTime, delayed, riskZone }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-1 mb-2">
      <Card className="p-2">
        <p className="text-xs text-muted-foreground">Total Servicios</p>
        <p className="text-2xl font-bold">{total}</p>
      </Card>
      
      <div className="grid grid-cols-1 gap-1">
        <Card className="bg-green-50 p-2 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700">En tiempo</p>
              <p className="text-xl font-bold text-green-700">{onTime}</p>
            </div>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        </Card>
        
        <Card className="bg-amber-50 p-2 border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700">Con retraso</p>
              <p className="text-xl font-bold text-amber-700">{delayed}</p>
            </div>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
        </Card>
        
        <Card className="bg-red-50 p-2 border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-700">Zona riesgo</p>
              <p className="text-xl font-bold text-red-700">{riskZone}</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
        </Card>
      </div>
    </div>
  );
}
