
import React from 'react';
import { Badge } from '@/components/ui/badge';

export function MapHeader() {
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-base">Ubicación de servicios activos</h2>
        <Badge variant="outline" className="bg-slate-100">
          En tiempo real
        </Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        Actualizado hace 5 mins
      </div>
    </div>
  );
}
