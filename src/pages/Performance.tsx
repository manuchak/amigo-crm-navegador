
import React, { useState } from 'react';
import { CustodioPerformanceDashboard } from "@/components/performance/CustodioPerformanceDashboard";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { DriverBehaviorHeader } from "@/components/performance/DriverBehaviorHeader";
import { ServiciosDashboard } from "@/components/performance/dashboard/ServiciosDashboard";
import { DriverBehaviorDashboard } from "@/components/performance/driver-behavior/DriverBehaviorDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeWithComparison } from "@/components/performance/filters/AdvancedDateRangePicker";
import { subDays } from "date-fns";
import { PerformanceDateFilter } from '@/components/performance/PerformanceDateFilter';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Performance() {
  // Initialize with the "last 90 days" preset
  const [dateRange, setDateRange] = useState<DateRangeWithComparison>({
    primary: {
      from: subDays(new Date(), 89),
      to: new Date(),
    },
    comparisonType: 'none',
    rangeType: 'last90days'
  });

  const [activeTab, setActiveTab] = useState<string>("servicios");
  
  // Show different header based on active tab
  const renderHeader = () => {
    if (activeTab === "driverBehavior") {
      return <DriverBehaviorHeader />;
    }
    return <PerformanceHeader />;
  };

  // Handle date range changes with validation
  const handleDateRangeChange = (newRange: DateRangeWithComparison) => {
    // Validate that the date range is not too large (e.g., more than 1 year)
    if (newRange.primary.from && newRange.primary.to) {
      const diffTime = Math.abs(newRange.primary.to.getTime() - newRange.primary.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 365) {
        toast.warning("Rango de fechas demasiado amplio", {
          description: "Por favor seleccione un rango menor a un año para un mejor rendimiento"
        });
        return;
      }
    }
    
    setDateRange(newRange);
  };

  return (
    <div className="container mx-auto space-y-8 py-8 px-4 md:px-6">
      <div>
        {renderHeader()}
      </div>
      
      <Card className="border shadow-sm p-4">
        <PerformanceDateFilter dateRange={dateRange} setDateRange={handleDateRangeChange} />
      </Card>
      
      <div className="mt-8">
        <Tabs 
          defaultValue="servicios" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 bg-background border shadow-sm rounded-lg p-1">
            <TabsTrigger value="servicios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Servicios</TabsTrigger>
            <TabsTrigger value="custodios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Custodios</TabsTrigger>
            <TabsTrigger value="driverBehavior" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Comportamiento de Conducción</TabsTrigger>
          </TabsList>
          
          <TabsContent value="servicios" className="mt-2 animate-fade-in">
            <ServiciosDashboard 
              dateRange={dateRange.primary} 
              comparisonRange={dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined} 
            />
          </TabsContent>
          
          <TabsContent value="custodios" className="mt-2 animate-fade-in">
            <CustodioPerformanceDashboard 
              dateRange={dateRange.primary} 
              comparisonRange={dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined} 
            />
          </TabsContent>
          
          <TabsContent value="driverBehavior" className="mt-2 animate-fade-in">
            <DriverBehaviorDashboard 
              dateRange={dateRange.primary} 
              comparisonRange={dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
