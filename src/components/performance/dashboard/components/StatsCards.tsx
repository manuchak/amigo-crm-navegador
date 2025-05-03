
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
    <div className="grid grid-cols-3 gap-3 mb-4">
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0">
        <CardContent className="p-4 text-center flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-3">
            <Clock className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-0.5">En tiempo</p>
          <p className="text-2xl font-bold text-green-600">{onTime}</p>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0">
        <CardContent className="p-4 text-center flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 mb-3">
            <Timer className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-0.5">Con retraso</p>
          <p className="text-2xl font-bold text-amber-600">{delayed}</p>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0">
        <CardContent className="p-4 text-center flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-0.5">Zona riesgo</p>
          <p className="text-2xl font-bold text-red-600">{riskZone}</p>
        </CardContent>
      </Card>
    </div>
  );
}
