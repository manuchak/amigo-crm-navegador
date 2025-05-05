
import React from 'react';
import { MapPin } from 'lucide-react';

export function MapHeader() {
  return (
    <div className="flex justify-between items-center bg-white rounded-lg border p-3 mb-2 shadow-sm">
      <div>
        <h3 className="text-sm font-medium">Servicios activos en ruta</h3>
        <p className="text-xs text-muted-foreground">
          Rutas en tiempo real basadas en carreteras
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-slate-50 px-2 py-1 rounded">
        <MapPin className="h-3 w-3" />
        <span>Actualizado hace 5 mins</span>
      </div>
    </div>
  );
}
