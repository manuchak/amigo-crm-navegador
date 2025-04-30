
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
      <div className="w-full h-full flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground text-lg">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <p className="text-2xl font-medium text-red-600">Error</p>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            No se pudieron cargar los datos. Por favor intente nuevamente.
          </p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="w-full h-full flex items-center justify-center py-16">
        <div className="text-center space-y-3 max-w-lg">
          <p className="text-xl font-medium">No hay datos disponibles</p>
          <p className="text-muted-foreground">
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
        <div className="mt-10 animate-fade-in animate-delay-200 duration-300">
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
