
import React from 'react';
import { Package } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center text-center p-8">
      <div className="max-w-sm animate-fade-in">
        <Package className="h-16 w-16 mx-auto mb-4 text-slate-200" />
        <p className="text-lg font-medium text-slate-700 mb-2">Seleccione un servicio</p>
        <p className="text-sm text-slate-500">
          Haga clic en un servicio activo del mapa o de la lista para ver sus detalles
        </p>
      </div>
    </div>
  );
}
