
import React from 'react';
import { Badge } from '@/components/ui/badge';

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-lg shadow-md border border-border/50">
      <div className="text-xs font-medium mb-1.5 text-muted-foreground">Leyenda</div>
      <div className="flex flex-col space-y-1.5">
        <Badge className="bg-green-500 flex items-center gap-1.5 shadow-sm py-1">
          <div className="w-2 h-2 rounded-full bg-white/90" />
          <span>En tiempo</span>
        </Badge>
        <Badge className="bg-amber-500 flex items-center gap-1.5 shadow-sm py-1">
          <div className="w-2 h-2 rounded-full bg-white/90" />
          <span>Riesgo de retraso</span>
        </Badge>
        <Badge className="bg-red-500 flex items-center gap-1.5 shadow-sm py-1">
          <div className="w-2 h-2 rounded-full bg-white/90" />
          <span>Zona de riesgo</span>
        </Badge>
      </div>
    </div>
  );
}
