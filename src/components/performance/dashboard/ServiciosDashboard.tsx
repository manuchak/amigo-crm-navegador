
import React, { useState, useEffect } from 'react';
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { fetchServiciosData } from '../services/servicios';
import { ServiciosMetricsCards } from './ServiciosMetricsCards';
import { toast } from 'sonner';
import { StatusOption } from "../filters/ServiceStatusFilter";
import { 
  StatusFilterSection,
  DashboardLayout,
  PerformanceChartsGrid,
  SecondaryChartsGrid,
  AlertsSection
} from './components';

interface ServiciosDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function ServiciosDashboard({ dateRange, comparisonRange }: ServiciosDashboardProps) {
  // Initialize status filter options
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([
    { label: "Completado", value: "Completado", checked: true },
    { label: "Pendiente", value: "Pendiente", checked: true },
    { label: "En progreso", value: "En progreso", checked: true },
    { label: "Cancelado", value: "Cancelado", checked: true },
  ]);
  
  // Filtered data state
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['servicios', dateRange, comparisonRange],
    queryFn: () => fetchServiciosData(dateRange, comparisonRange),
    refetchOnWindowFocus: false,
  });

  // Handle status filter changes
  const handleStatusFilterChange = (value: string, checked: boolean) => {
    setStatusOptions(prev => 
      prev.map(option => 
        option.value === value ? { ...option, checked } : option
      )
    );
  };
  
  // Filter data when raw data or filters change
  useEffect(() => {
    if (data?.serviciosData) {
      // Get active status filters
      const activeStatuses = statusOptions
        .filter(option => option.checked)
        .map(option => option.value);
      
      // Apply filters to data
      const filtered = data.serviciosData.filter((item: any) => {
        // If estado (status) is present, filter by it
        if (item.estado) {
          return activeStatuses.includes(item.estado);
        }
        // If no estado field, include it (don't filter)
        return true;
      });
      
      setFilteredData(filtered);
    }
  }, [data?.serviciosData, statusOptions]);

  // Debug logging for date range
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      console.log("ServiciosDashboard date range:", {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      });
    } else {
      console.warn("ServiciosDashboard received invalid date range");
    }
  }, [dateRange]);
  
  // Show error toast if fetch fails
  React.useEffect(() => {
    if (isError) {
      toast.error("Error al cargar datos", {
        description: "No se pudieron cargar los datos de servicios. Intente nuevamente."
      });
    }
  }, [isError]);

  // Check if we have data to display
  const hasData = !!(data && data.serviciosData && data.serviciosData.length > 0);

  return (
    <DashboardLayout
      isLoading={isLoading}
      isError={isError}
      hasData={hasData}
      dateRange={dateRange}
    >
      <div className="space-y-8">
        {/* Status filter */}
        <StatusFilterSection 
          statusOptions={statusOptions} 
          onStatusFilterChange={handleStatusFilterChange}
        />
        
        {/* Metrics cards at the top */}
        <div className="animate-fade-in duration-300">
          <ServiciosMetricsCards 
            data={data} 
            isLoading={isLoading} 
          />
        </div>
        
        {/* Performance chart and type distribution side by side */}
        <PerformanceChartsGrid
          filteredData={filteredData}
          isLoading={isLoading}
          dateRange={dateRange}
        />
        
        {/* Hour distribution and clients */}
        <SecondaryChartsGrid
          filteredData={filteredData}
          isLoading={isLoading}
          serviciosPorCliente={data?.serviciosPorCliente || []}
        />
        
        {/* Alerts section */}
        <AlertsSection
          alertas={data?.alertas || []}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
