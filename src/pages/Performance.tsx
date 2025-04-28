
import React, { useState } from 'react';
import { DateRange } from "react-day-picker";
import { CustodioPerformanceDashboard } from "@/components/performance/CustodioPerformanceDashboard";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { PerformanceFilter } from "@/components/performance/PerformanceFilter";
import { ServiciosDashboard } from "@/components/performance/dashboard/ServiciosDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Performance() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 90)), // Default to last 90 days
    to: new Date(),
  });

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  return (
    <div className="container mx-auto space-y-8 py-8 px-4 md:px-6">
      <PerformanceHeader />
      <PerformanceFilter dateRange={dateRange} setDateRange={handleDateRangeChange} />
      
      <div className="mt-8">
        <Tabs defaultValue="servicios" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="servicios">Servicios</TabsTrigger>
            <TabsTrigger value="custodios">Custodios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="servicios" className="mt-2">
            <ServiciosDashboard dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="custodios" className="mt-2">
            <CustodioPerformanceDashboard dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
