
import React, { ReactNode } from 'react';
import { Loader2 } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';

interface DashboardLayoutProps {
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  dateRange: { from?: Date; to?: Date };
  children: ReactNode;
}

export function DashboardLayout({
  isLoading,
  isError,
  hasData,
  dateRange,
  children
}: DashboardLayoutProps) {
  if (isError) {
    return (
      <Card className="p-8 text-center border shadow-sm bg-white">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-2 text-gray-800">Error al cargar datos</h3>
          <p className="text-muted-foreground">
            Ocurrió un error al cargar los datos de servicios. Por favor, inténtelo de nuevo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando datos de servicios...</p>
      </div>
    );
  }

  // Check if there's data for the selected date range
  if (dateRange?.from && dateRange?.to && !hasData) {
    return (
      <Card className="p-8 text-center border shadow-sm bg-white">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-2 text-gray-800">Sin datos para el período seleccionado</h3>
          <p className="text-muted-foreground">
            No hay datos de servicios disponibles para el rango de fechas seleccionado. 
            Intente seleccionar otro período.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
