import React, { useState, useMemo, useCallback } from 'react';
import { useCustodioKpi } from '@/hooks/useCustodioKpi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
import { RevenueAnalytics } from '@/components/performance/dashboard/RevenueAnalytics';
import { RetentionChart } from './charts/RetentionChart';
import { RevenueVsCacChart } from './charts/RevenueVsCacChart';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, subYears, startOfYear } from "date-fns";
import { DateRange } from "react-day-picker";
import DateRangePicker from './DateRangePicker';

// Helper to create tooltips for metrics
const MetricTooltip = ({ children, explanation }: { children: React.ReactNode, explanation: string }) => (
  <TooltipProvider>
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="text-sm max-w-xs">{explanation}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Change indicator showing performance compared to previous period
const ChangeIndicator = ({ currentValue, previousValue }: { currentValue?: number; previousValue?: number }) => {
  if (!currentValue || !previousValue) return null;
  
  const percentChange = previousValue !== 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  const isPositive = percentChange > 0;
  const isNeutral = percentChange === 0;
  
  return (
    <Badge 
      className={`ml-2 ${isPositive ? 'bg-green-100 text-green-800' : isNeutral ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}
    >
      {isPositive ? '▲' : isNeutral ? '●' : '▼'} {Math.abs(percentChange).toFixed(1)}%
    </Badge>
  );
};

// Helper to calculate months between dates
const calculateMonths = () => {
  const today = new Date();
  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 1);
  
  return Math.round((today.getTime() - lastYear.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
};

export const BusinessKpis = () => {
  // Add date range state with default values (last 12 months)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    to: new Date()
  });
  
  // Comparison type: month over month or year over year
  const [comparisonType, setComparisonType] = useState<'month' | 'year'>('month');
  
  // Function to map retention and ltv data for our charts - improved to handle data validation
  const mapRetentionData = useCallback((retentionData?: any[]) => {
    if (!retentionData) {
      console.log('BusinessKpis: No retention data provided to mapping function');
      return [];
    }
    
    console.log(`BusinessKpis: Mapping retention data for chart, received ${retentionData.length} records`);
    
    // Filter out invalid data points before mapping
    const validData = retentionData.filter(item => 
      item && 
      typeof item.retention_rate === 'number' && 
      !isNaN(item.retention_rate) &&
      item.month_year // Ensure we have a date to work with
    );
    
    console.log(`BusinessKpis: Found ${validData.length} valid retention records after filtering`);
    
    if (validData.length > 0) {
      console.log('BusinessKpis: Sample valid retention data:', validData[0]);
    } else {
      console.log('BusinessKpis: No valid retention data found after filtering');
    }
    
    return validData.map(item => ({
      month: item.month_year,
      rate: Number(item.retention_rate) // Ensure it's a number
    }));
  }, []);
  
  // Function to map revenue vs CAC data
  const mapRevenueVsCacData = useCallback((kpiData?: any[], metrics?: any[], newCustodiosData?: any[]) => {
    if (!kpiData || !metrics || !newCustodiosData) return [];
    
    // Create a map of metrics by month for easy lookup
    const metricsMap = new Map();
    metrics.forEach(metric => {
      metricsMap.set(metric.month_year, metric);
    });
    
    // Create a map of new custodios by month for easy lookup
    const custodiosMap = new Map();
    newCustodiosData.forEach(item => {
      custodiosMap.set(item.month_year, item.new_custodios);
    });
    
    return kpiData.map(item => {
      const metric = metricsMap.get(item.month_year);
      const newCustodios = custodiosMap.get(item.month_year) || 0;
      
      return {
        month_year: format(new Date(item.month_year), 'MMM yyyy'),
        revenue: item.total_revenue || 0,
        cac: metric ? (
          (metric.staff_cost || 0) + 
          (metric.marketing_cost || 0) + 
          (metric.asset_cost || 0)
        ) / (newCustodios || 1) : 0,
        new_custodios: newCustodios
      };
    });
  }, []);
  
  // Fetch data using our hook
  const {
    kpiData,
    metrics,
    newCustodios,
    retention,
    ltv,
    isLoading,
    nps,
    cac,
    marketingRoi,
    avgRetention,
    avgLtv,
    previousPeriodData
  } = useCustodioKpi(calculateMonths(), comparisonType); // Get data based on selected date range
  
  // Filter data based on selected date range
  const filterDataByDateRange = useCallback((data?: any[]) => {
    if (!dateRange.from || !dateRange.to || !data) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.month_year || item.date);
      return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
    });
  }, [dateRange]);
  
  // Define filtered data using the filter function
  const filteredKpiData = useMemo(() => filterDataByDateRange(kpiData || []), [kpiData, filterDataByDateRange]);
  const filteredRetention = useMemo(() => 
    filterDataByDateRange(retention || [])
  , [retention, filterDataByDateRange]);
  
  console.log(`BusinessKpis: Working with ${filteredRetention?.length || 0} retention records after date filtering`);
  
  // Prepare chart data 
  const retentionChartData = useMemo(() => 
    mapRetentionData(filteredRetention)
  , [filteredRetention, mapRetentionData]);
  
  console.log(`BusinessKpis: Generated ${retentionChartData?.length || 0} data points for retention chart`);
  
  const revenueVsCacData = useMemo(() => 
    mapRevenueVsCacData(filteredKpiData, metrics, newCustodios)
  , [filteredKpiData, metrics, newCustodios, mapRevenueVsCacData]);

  // Format currency
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">KPIs de Negocio</h2>
          <p className="text-muted-foreground text-sm">Métricas financieras y de rendimiento</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Comparar:</span>
            <Select value={comparisonType} onValueChange={(value) => setComparisonType(value as 'month' | 'year')}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Tipo de comparación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mes anterior</SelectItem>
                <SelectItem value="year">Año anterior</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange as (value: DateRange) => void}
          />
        </div>
      </div>
      
      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <MetricTooltip explanation="Ingresos totales generados por los servicios de custodia dentro del periodo seleccionado.">
                <p className="text-sm text-muted-foreground flex items-center">
                  Ingresos Totales <Info className="h-3.5 w-3.5 ml-1" />
                </p>
              </MetricTooltip>
            </div>
            <div className="mt-1 flex items-center">
              <h3 className="text-2xl font-semibold">
                {isLoading ? 'Cargando...' : formatCurrency(filteredKpiData.reduce((sum, item) => sum + (item.total_revenue || 0), 0))}
              </h3>
              <ChangeIndicator 
                currentValue={filteredKpiData.reduce((sum, item) => sum + (item.total_revenue || 0), 0)} 
                previousValue={previousPeriodData.totalRevenue} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <MetricTooltip explanation="Promedio de costo para adquirir un nuevo custodio, incluyendo marketing, personal y recursos.">
                <p className="text-sm text-muted-foreground flex items-center">
                  Costo de Adquisición <Info className="h-3.5 w-3.5 ml-1" />
                </p>
              </MetricTooltip>
            </div>
            <div className="mt-1 flex items-center">
              <h3 className="text-2xl font-semibold">
                {isLoading ? 'Cargando...' : formatCurrency(cac)}
              </h3>
              <ChangeIndicator 
                currentValue={cac} 
                previousValue={previousPeriodData.cac} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <MetricTooltip explanation="El valor estimado a largo plazo de un custodio basado en sus ingresos proyectados.">
                <p className="text-sm text-muted-foreground flex items-center">
                  LTV Promedio <Info className="h-3.5 w-3.5 ml-1" />
                </p>
              </MetricTooltip>
            </div>
            <div className="mt-1 flex items-center">
              <h3 className="text-2xl font-semibold">
                {isLoading ? 'Cargando...' : formatCurrency(avgLtv)}
              </h3>
              <ChangeIndicator 
                currentValue={avgLtv} 
                previousValue={previousPeriodData.avgLtv} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <MetricTooltip explanation="Relación entre el Valor de Vida del Cliente y el Costo de Adquisición. Un valor mayor a 3 es considerado saludable.">
                <p className="text-sm text-muted-foreground flex items-center">
                  Ratio LTV:CAC <Info className="h-3.5 w-3.5 ml-1" />
                </p>
              </MetricTooltip>
            </div>
            <div className="mt-1 flex items-center">
              <h3 className="text-2xl font-semibold">
                {isLoading ? 'Cargando...' : (avgLtv / (cac || 1)).toFixed(1)}
              </h3>
              <ChangeIndicator 
                currentValue={avgLtv / (cac || 1)} 
                previousValue={previousPeriodData.ltvCacRatio} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts with independent filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RetentionChart 
          data={retentionChartData}
          isLoading={isLoading}
          title="Retención de Custodios por Mes"
        />
        
        <RevenueVsCacChart 
          data={revenueVsCacData}
          isLoading={isLoading}
        />
      </div>
      
      {/* Detailed analytics sections */}
      <RevenueAnalytics 
        data={{
          totalRevenue: filteredKpiData.reduce((sum, item) => sum + (item.total_revenue || 0), 0),
          averageRevenue: filteredKpiData.reduce((sum, item) => sum + (item.avg_revenue_per_service || 0), 0) / (filteredKpiData.length || 1),
          byMonth: filteredKpiData.map(item => ({
            month: format(new Date(item.month_year), 'MMM yyyy'),
            revenue: item.total_revenue || 0
          })),
          byService: [
            { service: 'Custodia Armada', revenue: filteredKpiData.reduce((sum, item) => sum + ((item.total_revenue || 0) * 0.65), 0) },
            { service: 'Custodia Simple', revenue: filteredKpiData.reduce((sum, item) => sum + ((item.total_revenue || 0) * 0.35), 0) }
          ]
        }}
        isLoading={isLoading}
      />
    </div>
  );
};
