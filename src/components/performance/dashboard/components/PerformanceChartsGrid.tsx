
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in animate-delay-100 duration-300">
      {/* Performance chart taking 4/5 width on large screens */}
      <div className="lg:col-span-4 h-[580px]">
        <ServiciosPerformanceChart 
          data={filteredData} 
          isLoading={isLoading}
          dateRange={dateRange}
        />
      </div>
      
      {/* Services type chart taking 1/5 width */}
      <div className="h-[580px]">
        <ServiciosTipoChart 
          data={filteredData} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}
