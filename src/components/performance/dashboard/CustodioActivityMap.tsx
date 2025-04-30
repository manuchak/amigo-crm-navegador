
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityMapData {
  locations: { lat: number; lng: number; weight: number }[];
  heatData: any;
}

interface CustodioActivityMapProps {
  data?: ActivityMapData;
  isLoading: boolean;
}

export function CustodioActivityMap({ data, isLoading }: CustodioActivityMapProps) {
  return (
    <Card className="border shadow-sm rounded-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          Mapa de Actividad de Custodios
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-[540px] w-full rounded-md" />
        ) : (
          <div className="h-[540px] bg-slate-50 rounded-md flex items-center justify-center text-muted-foreground">
            <div className="text-center p-8 max-w-md">
              <h3 className="text-lg font-medium mb-2">Mapa de Actividad</h3>
              <p className="text-gray-500 text-sm">
                Esta sección mostrará un mapa de calor con la ubicación de actividad de los custodios.
                <br />
                Se requiere integración con una librería de mapas como Mapbox o Google Maps.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
