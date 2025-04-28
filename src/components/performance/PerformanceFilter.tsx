
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DateRangeWithComparison } from "./filters/AdvancedDateRangePicker";
import AdvancedDateRangePicker from './filters/AdvancedDateRangePicker';
import { ServiceImport } from './filters/ServiceImport';

interface PerformanceFilterProps {
  dateRange: DateRangeWithComparison;
  setDateRange: React.Dispatch<React.SetStateAction<DateRangeWithComparison>>;
}

export function PerformanceFilter({ dateRange, setDateRange }: PerformanceFilterProps) {
  return (
    <Card className="border-0 shadow-md bg-white/90">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-medium text-sm text-muted-foreground whitespace-nowrap">Filtros:</span>
            
            <AdvancedDateRangePicker 
              value={dateRange}
              onChange={setDateRange}
            />
          </div>

          <ServiceImport />
        </div>
      </CardContent>
    </Card>
  );
}
