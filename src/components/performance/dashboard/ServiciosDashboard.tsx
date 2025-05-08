
import React, { useEffect } from 'react';
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { fetchServiciosData } from '../services/servicios';
import { ServiciosMetricsCards } from './ServiciosMetricsCards';
import { toast } from 'sonner';
import { 
  DashboardLayout,
  PerformanceChartsGrid,
  SecondaryChartsGrid,
  AlertsSection,
  StatusBadgeFilter
} from './components';
import { useStatusFilters, useClienteFilters } from './hooks';
import { useAuth } from '@/context/auth'; // Added auth context import

export type { StatusOption } from './hooks/useStatusFilters';

interface ServiciosDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function ServiciosDashboard({ dateRange, comparisonRange }: ServiciosDashboardProps) {
  // Add auth context
  const { currentUser } = useAuth();
  
  console.log("ServiciosDashboard rendering with dateRange:", dateRange, "user:", currentUser?.email);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['servicios', dateRange, comparisonRange],
    queryFn: () => {
      console.log("Fetching servicios data with date range:", dateRange);
      
      if (!dateRange?.from || !dateRange?.to) {
        console.error("Invalid date range provided to fetchServiciosData", dateRange);
        return Promise.reject(new Error("Invalid date range"));
      }
      
      return fetchServiciosData(dateRange, comparisonRange);
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Debug logging after data fetch to understand data integrity issues
  useEffect(() => {
    console.log("Data fetched:", data);
    if (data?.serviciosData) {
      console.log("Total services in raw data:", data.serviciosData.length);
      
      // Log unique status values for debugging
      const uniqueStatuses = new Set();
      data.serviciosData.forEach((item: any) => {
        if (item.estado) uniqueStatuses.add(`"${item.estado}"`);
      });
      console.log("Unique statuses in data:", Array.from(uniqueStatuses).join(", "));

      // Check cobro_cliente data integrity
      const cobroClienteValues = data.serviciosData.slice(0, 20).map(s => ({
        id: s.id,
        cobro_cliente: s.cobro_cliente,
        type: typeof s.cobro_cliente
      }));
      console.log("Sample cobro_cliente values:", cobroClienteValues);
      
      // Analyze cobro_cliente data distribution
      const totalServices = data.serviciosData.length;
      const withCobro = data.serviciosData.filter(s => 
        s.cobro_cliente !== null && 
        s.cobro_cliente !== undefined && 
        s.cobro_cliente !== ''
      ).length;
      const validNumericCobro = data.serviciosData.filter(s => {
        const val = Number(s.cobro_cliente);
        return !isNaN(val) && val > 0;
      }).length;
      
      console.log("cobro_cliente data analysis:", {
        total: totalServices,
        withAnyValue: withCobro,
        withValidNumericValue: validNumericCobro,
        percentWithValue: ((withCobro / totalServices) * 100).toFixed(1) + '%',
        percentWithValidValue: ((validNumericCobro / totalServices) * 100).toFixed(1) + '%'
      });
    }
  }, [data]);
  
  // Use our custom hooks for filtering
  const { statusOptions, filteredData, handleStatusFilterChange, toggleAllFilters } = useStatusFilters(data?.serviciosData);
  const filteredClientesData = useClienteFilters(data?.serviciosPorCliente, data?.serviciosData, filteredData);
  
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
  const hasFilteredData = !!(filteredData && filteredData.length > 0);
  
  console.log("Dashboard render state:", { 
    isLoading, 
    isError, 
    hasData, 
    hasFilteredData, 
    filteredDataCount: filteredData?.length,
    totalDataCount: data?.serviciosData?.length
  });

  return (
    <DashboardLayout
      isLoading={isLoading}
      isError={isError}
      hasData={hasData && hasFilteredData}
      dateRange={dateRange}
      serviciosData={data?.serviciosData}
      comparisonDateRange={comparisonRange}
    >
      <div className="space-y-4">
        {/* Metrics cards at the top */}
        <div className="animate-fade-in duration-300">
          <ServiciosMetricsCards 
            data={data} 
            isLoading={isLoading}
            filteredData={filteredData}
          />
        </div>
        
        {/* Subtle filter bar */}
        <div className="bg-white/50 backdrop-blur-sm border border-border/40 rounded-md px-3 py-2 animate-fade-in duration-300">
          <StatusBadgeFilter 
            statusOptions={statusOptions} 
            onStatusFilterChange={handleStatusFilterChange}
            onToggleAll={toggleAllFilters}
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
          serviciosPorCliente={filteredClientesData}
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
