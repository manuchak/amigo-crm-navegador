
import React from 'react';

export function PerformanceHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-gray-900">Rendimiento</h1>
        <p className="text-muted-foreground mt-2 text-gray-500 max-w-2xl">
          Monitoreo y análisis de rendimiento de operaciones
        </p>
      </div>
    </div>
  );
}
