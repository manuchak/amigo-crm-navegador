
import React from 'react';
import { DateRange } from "react-day-picker";
import { 
  PerformanceMetricsCards,
  PerformanceCharts,
  CustodioTable,
  CustodioActivityMap,
  RevenueAnalytics,
  RetentionMetrics,
  CustodioRetentionTable
} from "@/components/performance/dashboard";
import { CustodioPerformanceMetrics } from "@/components/performance/CustodioPerformanceMetrics"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustodioPerformanceData } from "@/components/performance/hooks/useCustodioPerformanceData";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardHeader, CardTitle, Card, CardContent } from "@/components/ui/card";
import { RefreshCwIcon } from "lucide-react";

interface CustodioPerformanceDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function CustodioPerformanceDashboard({ dateRange, comparisonRange }: CustodioPerformanceDashboardProps) {
  const { data, isLoading, error } = useCustodioPerformanceData(dateRange, comparisonRange);
  
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error al cargar datos</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los datos de custodios. Por favor, intente de nuevo más tarde.
          </AlertDescription>
        </Alert>
      )}

      <CustodioPerformanceMetrics dateRange={dateRange} comparisonRange={comparisonRange} />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-white/70 backdrop-blur-sm border shadow-sm rounded-xl p-1.5 w-auto inline-flex">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm"
          >
            Resumen
          </TabsTrigger>
          <TabsTrigger 
            value="custodios" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm"
          >
            Custodios
          </TabsTrigger>
          <TabsTrigger 
            value="revenue" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm"
          >
            Ingresos
          </TabsTrigger>
          <TabsTrigger 
            value="retention" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm"
          >
            Retención
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm"
          >
            Actividad
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8 mt-2 animate-fade-in duration-300">
          <PerformanceCharts 
            performanceData={data?.performanceByDay} 
            isLoading={isLoading} 
          />
        </TabsContent>

        <TabsContent value="custodios" className="mt-2 animate-fade-in duration-300">
          <CustodioTable data={data?.custodios} isLoading={isLoading} />
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Distribución de Calificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {!isLoading && data?.custodios && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {calculateRatingDistribution(data.custodios).map((range, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Calificación {range.label}</p>
                              <p className="text-2xl font-semibold">{range.count}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${getRatingRangeColor(range.label)}`}>
                              <Star className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="mt-2 bg-gray-100 rounded-full h-2">
                            <div 
                              className={`h-full rounded-full ${getRatingRangeBarColor(range.label)}`}
                              style={{width: `${range.percentage}%`}}
                            ></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{range.percentage}% del total</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-8 mt-2 animate-fade-in duration-300">
          <RevenueAnalytics data={data?.revenue} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="retention" className="mt-2 animate-fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RetentionMetrics data={data?.retention} isLoading={isLoading} />
            <CustodioRetentionTable data={data?.custodios} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-2 animate-fade-in duration-300">
          <CustodioActivityMap data={data?.activityMap} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// Helper function to calculate rating distribution
function calculateRatingDistribution(custodios: any[] = []) {
  // Define rating ranges
  const ranges = [
    { label: '1.0-2.4', min: 1.0, max: 2.4, count: 0, percentage: 0 },
    { label: '2.5-3.4', min: 2.5, max: 3.4, count: 0, percentage: 0 },
    { label: '3.5-4.4', min: 3.5, max: 4.4, count: 0, percentage: 0 },
    { label: '4.5-5.0', min: 4.5, max: 5.0, count: 0, percentage: 0 },
  ];
  
  custodios.forEach(custodio => {
    const rating = custodio.averageRating;
    for (const range of ranges) {
      if (rating >= range.min && rating <= range.max) {
        range.count++;
        break;
      }
    }
  });
  
  // Calculate percentages
  const total = custodios.length;
  ranges.forEach(range => {
    range.percentage = total > 0 ? Math.round((range.count / total) * 100) : 0;
  });
  
  return ranges;
}

function getRatingRangeColor(label: string) {
  switch(label) {
    case '4.5-5.0': return 'bg-emerald-50 text-emerald-600';
    case '3.5-4.4': return 'bg-green-50 text-green-600';
    case '2.5-3.4': return 'bg-amber-50 text-amber-600';
    default: return 'bg-red-50 text-red-600';
  }
}

function getRatingRangeBarColor(label: string) {
  switch(label) {
    case '4.5-5.0': return 'bg-emerald-500';
    case '3.5-4.4': return 'bg-green-500';
    case '2.5-3.4': return 'bg-amber-500';
    default: return 'bg-red-500';
  }
}

// Import from lucide-react
function Star(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
