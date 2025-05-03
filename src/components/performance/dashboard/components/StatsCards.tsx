
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertCircle, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  total: number;
  onTime: number;
  delayed: number;
  riskZone: number;
}

export function StatsCards({ total, onTime, delayed, riskZone }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-2">
      <Card className="bg-white shadow-sm hover:shadow transition-all duration-300 border">
        <CardContent className="p-2 text-center flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 mb-1">
            <Clock className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">En tiempo</p>
          <p className="text-lg font-bold text-green-600">{onTime}</p>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-sm hover:shadow transition-all duration-300 border">
        <CardContent className="p-2 text-center flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 mb-1">
            <Timer className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">Con retraso</p>
          <p className="text-lg font-bold text-amber-600">{delayed}</p>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-sm hover:shadow transition-all duration-300 border">
        <CardContent className="p-2 text-center flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 mb-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">Zona riesgo</p>
          <p className="text-lg font-bold text-red-600">{riskZone}</p>
        </CardContent>
      </Card>
    </div>
  );
}
