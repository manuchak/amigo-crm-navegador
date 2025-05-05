
import React from 'react';

export function MapHeader() {
  return (
    <div className="flex justify-between items-center bg-white rounded-lg border p-2 mb-2 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold">Ubicación de servicios activos</h3>
        <p className="text-xs text-muted-foreground">
          En tiempo real
        </p>
      </div>
      <div className="text-xs text-muted-foreground flex items-center">
        <span>Actualizado hace 5 mins</span>
      </div>
    </div>
  );
}
