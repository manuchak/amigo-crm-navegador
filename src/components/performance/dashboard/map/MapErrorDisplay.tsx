
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface MapErrorDisplayProps {
  errorMessage: string;
}

export function MapErrorDisplay({ errorMessage }: MapErrorDisplayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-center p-6">
      <div className="max-w-md">
        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Error al cargar el mapa</h3>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <p className="text-sm mt-4">Verifique su conexión a internet o que el token de Mapbox sea válido.</p>
      </div>
    </div>
  );
}
