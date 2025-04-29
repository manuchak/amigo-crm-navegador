
import React from 'react';
import { DateRangeWithComparison } from "./filters/AdvancedDateRangePicker";
import AdvancedDateRangePicker from './filters/AdvancedDateRangePicker';
import { CalendarIcon } from "lucide-react";

interface PerformanceDateFilterProps {
  dateRange: DateRangeWithComparison;
  setDateRange: React.Dispatch<React.SetStateAction<DateRangeWithComparison>>;
}

export function PerformanceDateFilter({ dateRange, setDateRange }: PerformanceDateFilterProps) {
  // Handle date range change
  const handleDateRangeChange = (newRange: DateRangeWithComparison) => {
    console.log("Date range changed:", newRange);
    setDateRange(newRange);
  };
  
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarIcon className="h-4 w-4" />
        <span>Período:</span>
      </div>
      
      <AdvancedDateRangePicker 
        value={dateRange}
        onChange={handleDateRangeChange}
      />
    </div>
  );
}
