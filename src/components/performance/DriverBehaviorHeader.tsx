
import React from 'react';
import { DriverBehaviorImport } from './driver-behavior/DriverBehaviorImport';
import { useQueryClient } from "@tanstack/react-query";

export function DriverBehaviorHeader() {
  const queryClient = useQueryClient();
  
  const handleImportComplete = () => {
    // Invalidate queries to refresh data after import
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-data'] });
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-clients'] });
    window.location.reload();
  };
  
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
          <DriverBehaviorImport onImportComplete={handleImportComplete} />
        </div>
      </div>
    </div>
  );
}
