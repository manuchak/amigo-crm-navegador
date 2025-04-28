
import React, { useState } from 'react';
import { CustodioPerformanceDashboard } from "@/components/performance/CustodioPerformanceDashboard";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { DriverBehaviorHeader } from "@/components/performance/DriverBehaviorHeader";
import { PerformanceFilter } from "@/components/performance/PerformanceFilter";
import { ServiciosDashboard } from "@/components/performance/dashboard/ServiciosDashboard";
import { DriverBehaviorDashboard } from "@/components/performance/driver-behavior/DriverBehaviorDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeWithComparison } from "@/components/performance/filters/AdvancedDateRangePicker";
import { subDays } from "date-fns";

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

  return (
    <div className="container mx-auto space-y-8 py-8 px-4 md:px-6">
      {renderHeader()}
      <PerformanceFilter dateRange={dateRange} setDateRange={setDateRange} />
      
      <div className="mt-8">
        <Tabs 
          defaultValue="servicios" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="servicios">Servicios</TabsTrigger>
            <TabsTrigger value="custodios">Custodios</TabsTrigger>
            <TabsTrigger value="driverBehavior">Comportamiento de Conducción</TabsTrigger>
          </TabsList>
          
          <TabsContent value="servicios" className="mt-2">
            <ServiciosDashboard 
              dateRange={dateRange.primary} 
              comparisonRange={dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined} 
            />
          </TabsContent>
          
          <TabsContent value="custodios" className="mt-2">
            <CustodioPerformanceDashboard 
              dateRange={dateRange.primary} 
              comparisonRange={dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined} 
            />
          </TabsContent>
          
          <TabsContent value="driverBehavior" className="mt-2">
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
