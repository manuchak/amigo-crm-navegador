
import { useState, useEffect, useMemo } from 'react';

export interface StatusOption {
  label: string;
  value: string;
  checked: boolean;
  color?: string;
}

export function useStatusFilters(rawData: any[] | undefined) {
  // Initialize status filter options with appropriate colors
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  
  // Filtered data state
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  // Dynamically generate status options from the data
  useEffect(() => {
    if (!rawData?.length) return;
    
    // Extract unique statuses from data
    const uniqueStatuses = new Set<string>();
    rawData.forEach(item => {
      if (item.estado && typeof item.estado === 'string') {
        uniqueStatuses.add(item.estado.trim());
      }
    });
    
    // Map to status options (all checked by default)
    const options = Array.from(uniqueStatuses).map(status => ({
      label: status,
      value: status,
      checked: true,
      color: getStatusColor(status)
    }));
    
    console.log("Generated status options:", options);
    setStatusOptions(options);
  }, [rawData]);
  
  // Get appropriate color based on status
  const getStatusColor = (status: string): string => {
    const normalized = status.toLowerCase();
    if (normalized.includes('completado')) return 'success';
    if (normalized.includes('pendiente')) return 'warning';
    if (normalized.includes('progreso')) return 'info';
    if (normalized.includes('cancel')) return 'destructive';
    return 'secondary';
  };
  
  // Handle status filter changes
  const handleStatusFilterChange = (value: string, checked: boolean) => {
    setStatusOptions(prev => 
      prev.map(option => 
        option.value === value ? { ...option, checked } : option
      )
    );
  };
  
  // Toggle all filters
  const toggleAllFilters = (checked: boolean) => {
    setStatusOptions(prev => 
      prev.map(option => ({ ...option, checked }))
    );
  };
  
  // Filter data when raw data or filters change
  useEffect(() => {
    if (!rawData) {
      setFilteredData([]);
      return;
    }
    
    // Get active status filters
    const activeStatuses = statusOptions
      .filter(option => option.checked)
      .map(option => option.value);
    
    console.log("Active status filters:", activeStatuses);
    
    if (activeStatuses.length === 0) {
      // If no status is selected, show no data
      setFilteredData([]);
      return;
    }
    
    const filtered = rawData.filter((item: any) => {
      // If item has no estado field, don't include it
      if (!item.estado || item.estado.trim() === '') {
        return false;
      }
      
      // Get normalized item status
      const normalizedItemStatus = item.estado.trim();
      
      // Check if the status matches any of the active filters
      return activeStatuses.some(activeStatus => 
        normalizedItemStatus === activeStatus
      );
    });
    
    console.log(`Filtering applied: ${filtered.length} out of ${rawData.length} items matched filters`);
    setFilteredData(filtered);
  }, [rawData, statusOptions]);

  return {
    statusOptions,
    filteredData,
    handleStatusFilterChange,
    toggleAllFilters
  };
}
