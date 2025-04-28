
import React from 'react';
import { DateRange } from "react-day-picker";
import { 
  PerformanceMetricsCards,
  PerformanceCharts,
  CustodioTable,
  CustodioActivityMap,
  RevenueAnalytics,
  RetentionMetrics
} from "@/components/performance/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustodioPerformanceData } from "@/components/performance/hooks/useCustodioPerformanceData";

interface CustodioPerformanceDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function CustodioPerformanceDashboard({ dateRange, comparisonRange }: CustodioPerformanceDashboardProps) {
  const { data, isLoading } = useCustodioPerformanceData(dateRange);
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="custodios">Custodios</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="retention">Retención</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-2">
          <PerformanceMetricsCards data={data?.summaryMetrics} isLoading={isLoading} />
          <PerformanceCharts 
            performanceData={data?.performanceByDay} 
            isLoading={isLoading} 
          />
        </TabsContent>

        <TabsContent value="custodios" className="mt-2">
          <CustodioTable data={data?.custodios} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6 mt-2">
          <RevenueAnalytics data={data?.revenue} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="retention" className="mt-2">
          <RetentionMetrics data={data?.retention} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="activity" className="mt-2">
          <CustodioActivityMap data={data?.activityMap} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
