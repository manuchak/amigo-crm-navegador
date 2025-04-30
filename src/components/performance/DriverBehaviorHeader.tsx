
import React from 'react';

export function DriverBehaviorHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-gray-900">Comportamiento de Conducción</h1>
        <p className="text-muted-foreground mt-1 text-gray-500">
          Análisis detallado del comportamiento de conducción y productividad de los conductores
        </p>
      </div>
    </div>
  );
}
