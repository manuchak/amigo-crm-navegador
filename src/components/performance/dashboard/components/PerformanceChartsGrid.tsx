
import React from 'react';
import { ServiciosPerformanceChart } from '../charts/servicios-performance';
import { ServiciosTipoChart } from '../ServiciosTipoChart';
import { DateRange } from 'react-day-picker';

interface PerformanceChartsGridProps {
  filteredData: any[];
  isLoading: boolean;
  dateRange: DateRange;
}

export function PerformanceChartsGrid({
  filteredData,
  isLoading,
  dateRange
}: PerformanceChartsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-100 duration-300">
      {/* Performance chart taking 2/3 width on large screens */}
      <div className="lg:col-span-2 h-[500px]">
        <ServiciosPerformanceChart 
          data={filteredData} 
          isLoading={isLoading}
          dateRange={dateRange}
        />
      </div>
      
      {/* Services type chart taking 1/3 width */}
      <div className="h-[500px]">
        <ServiciosTipoChart 
          data={filteredData} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}
