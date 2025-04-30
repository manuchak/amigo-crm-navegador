
import React from 'react';
import { DateRangeWithComparison, DateRangePreset } from "./filters/AdvancedDateRangePicker";
import AdvancedDateRangePicker from './filters/AdvancedDateRangePicker';

interface PerformanceDateFilterProps {
  dateRange: DateRangeWithComparison;
  setDateRange: (newRange: DateRangeWithComparison) => void;
  presets?: DateRangePreset[];
}

export function PerformanceDateFilter({ dateRange, setDateRange, presets }: PerformanceDateFilterProps) {
  // Handle date range change
  const handleDateRangeChange = (newRange: DateRangeWithComparison) => {
    console.log("Date range changed:", newRange);
    setDateRange(newRange);
  };
  
  return (
    <div className="flex items-center gap-4">
      <span className="font-medium text-sm text-muted-foreground whitespace-nowrap">Filtros:</span>
      
      <AdvancedDateRangePicker 
        value={dateRange}
        onChange={handleDateRangeChange}
        presets={presets}
      />
    </div>
  );
}
