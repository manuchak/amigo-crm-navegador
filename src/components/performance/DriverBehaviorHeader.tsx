
import React from 'react';

export function DriverBehaviorHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comportamiento de Conducción</h1>
        <p className="text-muted-foreground mt-1">
          Análisis detallado de conductas de manejo y puntos de penalización
        </p>
      </div>
    </div>
  );
}
