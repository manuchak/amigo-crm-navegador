
import React from 'react';

export function PerformanceHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-gray-900">Desempeño de Custodios</h1>
        <p className="text-muted-foreground mt-1 text-gray-500">
          Análisis detallado del rendimiento y actividad de los custodios
        </p>
      </div>
    </div>
  );
}
