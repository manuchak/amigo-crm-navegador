
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
import { motion } from "framer-motion";

interface CustodioPerformanceDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function CustodioPerformanceDashboard({ dateRange, comparisonRange }: CustodioPerformanceDashboardProps) {
  const { data, isLoading } = useCustodioPerformanceData(dateRange);
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-5 bg-white/70 backdrop-blur-sm border shadow-sm rounded-xl p-1 w-auto inline-flex">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm"
          >
            Resumen
          </TabsTrigger>
          <TabsTrigger 
            value="custodios" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm"
          >
            Custodios
          </TabsTrigger>
          <TabsTrigger 
            value="revenue" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm"
          >
            Ingresos
          </TabsTrigger>
          <TabsTrigger 
            value="retention" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm"
          >
            Retención
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm"
          >
            Actividad
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-2 animate-fade-in duration-300">
          <PerformanceMetricsCards data={data?.summaryMetrics} isLoading={isLoading} />
          <PerformanceCharts 
            performanceData={data?.performanceByDay} 
            isLoading={isLoading} 
          />
        </TabsContent>

        <TabsContent value="custodios" className="mt-2 animate-fade-in duration-300">
          <CustodioTable data={data?.custodios} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6 mt-2 animate-fade-in duration-300">
          <RevenueAnalytics data={data?.revenue} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="retention" className="mt-2 animate-fade-in duration-300">
          <RetentionMetrics data={data?.retention} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="activity" className="mt-2 animate-fade-in duration-300">
          <CustodioActivityMap data={data?.activityMap} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
