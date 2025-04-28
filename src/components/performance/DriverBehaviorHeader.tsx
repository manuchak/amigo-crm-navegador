
import React from 'react';
import { DriverBehaviorImport } from './driver-behavior/DriverBehaviorImport';

export function DriverBehaviorHeader() {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comportamiento de Conducción</h1>
          <p className="text-muted-foreground">
            Analiza el comportamiento de los conductores, evalúa riesgos y optimiza la seguridad vial
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <DriverBehaviorImport onImportComplete={() => window.location.reload()} />
        </div>
      </div>
    </div>
  );
}
