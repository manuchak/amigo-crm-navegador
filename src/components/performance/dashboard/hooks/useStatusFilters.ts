
import { useState, useEffect } from 'react';

export interface StatusOption {
  label: string;
  value: string;
  checked: boolean;
}

export function useStatusFilters(rawData: any[] | undefined) {
  // Initialize status filter options
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([
    { label: "Completado", value: "Completado", checked: true },
    { label: "Pendiente", value: "Pendiente", checked: true },
    { label: "En progreso", value: "En progreso", checked: true },
    { label: "Cancelado", value: "Cancelado", checked: true },
  ]);
  
  // Filtered data state
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
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
    if (!rawData) return;
    
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
    
    const filtered = rawData.filter((item: any) => {
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
    
    console.log(`Filtering applied: ${filtered.length} out of ${rawData.length} items matched filters`);
    
    // Additional logging for some filtered items
    if (filtered.length > 0 && filtered.length <= 5) {
      filtered.forEach((item, idx) => {
        console.log(`Filtered item ${idx}: estado=${item.estado}, id=${item.id}`);
      });
    }
    
    setFilteredData(filtered);
  }, [rawData, statusOptions]);

  return {
    statusOptions,
    filteredData,
    handleStatusFilterChange
  };
}
