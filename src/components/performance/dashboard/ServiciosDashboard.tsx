
import React, { useState, useEffect } from 'react';
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { fetchServiciosData } from '../services/servicios';
import { ServiciosMetricsCards } from './ServiciosMetricsCards';
import { toast } from 'sonner';
import { 
  StatusFilterSection,
  DashboardLayout,
  PerformanceChartsGrid,
  SecondaryChartsGrid,
  AlertsSection
} from './components';

export interface StatusOption {
  label: string;
  value: string;
  checked: boolean;
}

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
  
  console.log("ServiciosDashboard rendering with dateRange:", dateRange);
  
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

  // Debug logging after data fetch
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
    }
  }, [data]);

  // Handle status filter changes
  const handleStatusFilterChange = (value: string, checked: boolean) => {
    console.log(`Status filter changed: ${value} = ${checked}`);
    setStatusOptions(prev => 
      prev.map(option => 
        option.value === value ? { ...option, checked } : option
      )
    );
  };
  
  // Filter data when raw data or filters change
  useEffect(() => {
    if (!data?.serviciosData) return;
    
    // Get active status filters
    const activeStatuses = statusOptions
      .filter(option => option.checked)
      .map(option => option.value);
    
    console.log("Active status filters:", activeStatuses);
    
    if (activeStatuses.length === 0) {
      // If no status is selected, show no data
      console.log("No status filters selected, showing no data");
      setFilteredData([]);
      return;
    }
    
    const filtered = data.serviciosData.filter((item: any) => {
      // If item has no estado field or it's empty, include it only if we want to show "unspecified" items
      if (!item.estado || item.estado.trim() === '') {
        return statusOptions.some(opt => opt.checked && opt.value === "Unspecified");
      }
      
      // Get normalized item status
      const normalizedItemStatus = item.estado.trim();
      
      // Debug specific items
      if (Math.random() < 0.05) { // Sample ~5% of items for logging
        console.log(`Item status check: "${normalizedItemStatus}" against active statuses:`, activeStatuses);
      }
      
      // Check if the status matches any of the active filters (case-insensitive)
      return activeStatuses.some(activeStatus => {
        const statusMatches = normalizedItemStatus.toLowerCase() === activeStatus.toLowerCase();
        return statusMatches;
      });
    });
    
    console.log(`Filtering applied: ${filtered.length} out of ${data.serviciosData.length} items matched filters`);
    
    // Additional logging for some filtered items
    if (filtered.length > 0 && filtered.length <= 5) {
      filtered.forEach((item, idx) => {
        console.log(`Filtered item ${idx}: estado=${item.estado}, id=${item.id}`);
      });
    }
    
    setFilteredData(filtered);
  }, [data?.serviciosData, statusOptions]);
  
  // Filter client data by status
  const filteredClientesData = React.useMemo(() => {
    if (!data?.serviciosPorCliente || !filteredData) return [];
    
    // Get the IDs of filtered services
    const filteredIds = new Set(filteredData.map((item: any) => item.id));
    
    // Only return clients that have services in the filtered set
    const activeClientes = data.serviciosPorCliente.filter(cliente => {
      // Find services for this client in the raw data
      const clientServices = data.serviciosData.filter(
        (servicio: any) => servicio.nombre_cliente === cliente.nombre_cliente
      );
      
      // Check if any of these services are in our filtered set
      return clientServices.some((servicio: any) => filteredIds.has(servicio.id));
    }).map(cliente => {
      // Count only services that match our filter for this client
      const filteredCount = data.serviciosData.filter(
        (servicio: any) => 
          servicio.nombre_cliente === cliente.nombre_cliente && 
          filteredIds.has(servicio.id)
      ).length;
      
      return {
        ...cliente,
        totalServicios: filteredCount
      };
    });
    
    console.log("Filtered client data:", activeClientes.length);
    return activeClientes;
  }, [data?.serviciosPorCliente, data?.serviciosData, filteredData]);
  
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
    >
      <div className="space-y-6">
        {/* Status filter */}
        <div className="animate-fade-in duration-300">
          <StatusFilterSection 
            statusOptions={statusOptions} 
            onStatusFilterChange={handleStatusFilterChange}
          />
        </div>
        
        {/* Metrics cards at the top */}
        <div className="animate-fade-in duration-300">
          <ServiciosMetricsCards 
            data={data} 
            isLoading={isLoading}
            filteredData={filteredData}
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
