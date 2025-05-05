
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustodioPerformanceDashboard } from "@/components/performance/CustodioPerformanceDashboard";
import { ServiciosDashboard } from "@/components/performance/dashboard/ServiciosDashboard";
import { DriverBehaviorDashboard } from "@/components/performance/driver-behavior/DriverBehaviorDashboard";
import { DateRange } from "react-day-picker";

interface PerformanceTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  dateRange: {
    primary: DateRange;
    comparison?: DateRange;
  };
}

export function PerformanceTabs({ activeTab, setActiveTab, dateRange }: PerformanceTabsProps) {
  return (
    <Tabs 
      value={activeTab} 
      className="w-full"
      onValueChange={setActiveTab}
    >
      <TabsList className="mb-6 bg-background/70 border shadow-sm rounded-xl p-1.5 w-auto inline-flex">
        <TabsTrigger value="servicios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm">
          Servicios
        </TabsTrigger>
        <TabsTrigger value="custodios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm">
          Custodios
        </TabsTrigger>
        <TabsTrigger value="driverBehavior" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm">
          Comportamiento de Conducción
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="servicios" className="mt-0 animate-fade-in duration-300">
        <ServiciosDashboard 
          dateRange={dateRange.primary} 
          comparisonRange={dateRange.comparison} 
        />
      </TabsContent>
      
      <TabsContent value="custodios" className="mt-0 animate-fade-in duration-300">
        <CustodioPerformanceDashboard 
          dateRange={dateRange.primary} 
          comparisonRange={dateRange.comparison} 
        />
      </TabsContent>
      
      <TabsContent value="driverBehavior" className="mt-0 animate-fade-in duration-300">
        <DriverBehaviorDashboard 
          dateRange={dateRange.primary} 
          comparisonRange={dateRange.comparison} 
        />
      </TabsContent>
    </Tabs>
  );
}
