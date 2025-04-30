
import React from 'react';
import { DateRange } from "react-day-picker";
import { ClientGrowthAnalysis } from '../ClientGrowthAnalysis';

interface DashboardLayoutProps {
  children: React.ReactNode;
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  dateRange: DateRange;
  serviciosData?: any[];
  comparisonDateRange?: DateRange;
}

export function DashboardLayout({ 
  children, 
  isLoading, 
  isError, 
  hasData,
  dateRange,
  serviciosData = [],
  comparisonDateRange
}: DashboardLayoutProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-2xl font-medium text-red-600">Error</p>
          <p className="text-muted-foreground">
            No se pudieron cargar los datos. Por favor intente nuevamente.
          </p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="w-full h-full flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-xl font-medium">No hay datos disponibles</p>
          <p className="text-muted-foreground max-w-md">
            No se encontraron datos para el rango de fechas seleccionado.
            Prueba seleccionando un rango de fechas diferente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="animate-fade-in duration-300">
        {children}
      </div>
      
      {/* Add the Client Growth Analysis component */}
      {serviciosData && serviciosData.length > 0 && (
        <div className="mt-8 animate-fade-in animate-delay-200 duration-300">
          <ClientGrowthAnalysis 
            serviciosData={serviciosData}
            isLoading={isLoading}
            dateRange={dateRange}
            comparisonDateRange={comparisonDateRange}
          />
        </div>
      )}
    </div>
  );
}
