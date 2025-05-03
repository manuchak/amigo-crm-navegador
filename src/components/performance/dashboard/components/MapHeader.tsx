
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock } from 'lucide-react';

export function MapHeader() {
  return (
    <Card className="mb-4 shadow-md border-0 bg-white overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Monitoreo en Vivo</h2>
            <p className="text-xs text-muted-foreground">Visualización de servicios en ruta</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-white flex items-center gap-1.5 px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Badge>
          <Badge variant="outline" className="bg-white flex items-center gap-1.5 px-2.5 py-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
