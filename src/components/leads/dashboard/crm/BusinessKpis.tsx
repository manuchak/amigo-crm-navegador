import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustodioKpi } from "@/hooks/useCustodioKpi";
import { Loader2, TrendingUp, Users, Wallet, BarChart3, LineChart, Activity, Star, ArrowUp, ArrowDown, Calendar, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart as RechartLineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, BarChart, Bar } from "recharts";
import { formatCurrency, formatPercent } from "./crmUtils";
import { MetricsForm } from "./MetricsForm";
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DateRangePicker from "./DateRangePicker";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths } from "date-fns";

// Helper to create tooltips for metrics
const MetricTooltip = ({ children, explanation }: { children: React.ReactNode, explanation: string }) => (
  <TooltipProvider>
    <TooltipUI>
      <TooltipTrigger asChild>
        <div className="cursor-help">{children}</div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-white p-3 text-sm shadow-lg rounded-lg border">
        <p>{explanation}</p>
      </TooltipContent>
    </TooltipUI>
  </TooltipProvider>
);

// Helper to render trend indicators
const TrendIndicator = ({ value, suffix = '%' }: { value: number, suffix?: string }) => {
  if (isNaN(value) || value === 0) return null;
  
  const isPositive = value > 0;
  const Icon = isPositive ? ArrowUp : ArrowDown;
  const colorClass = isPositive 
    ? "text-emerald-600 bg-emerald-50" 
    : "text-rose-600 bg-rose-50";
  
  return (
    <div className={`flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1 ${colorClass}`}>
      <Icon className="h-3 w-3" />
      <span>{Math.abs(value).toFixed(1)}{suffix}</span>
    </div>
  );
};

export const BusinessKpis = () => {
  // Add date range state with default values (last 12 months)
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    to: new Date()
  });
  
  // Add comparison period state
  const [comparisonType, setComparisonType] = useState<"month" | "year">("month");
  
  // State for retention chart data
  const [retentionData, setRetentionData] = useState<any[]>([]);
  
  // Calculate months between dates for the API call
  const calculateMonths = () => {
    if (!dateRange.from || !dateRange.to) return 24; // Default to 24 months
    
    const start = new Date(dateRange.from);
    const end = new Date(dateRange.to);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  };
  
  const { 
    kpiData, metrics, newCustodios, retention, ltv, 
    isLoading, isError, updateMetrics, isUpdating,
    nps, cac, marketingRoi, avgRetention, avgLtv, ltvCacRatio,
    previousPeriodData
  } = useCustodioKpi(calculateMonths(), comparisonType); // Get data based on selected date range
  
  // Filter data based on selected date range - moved up for proper variable declaration order
  const filterDataByDateRange = useCallback((data: any[]) => {
    if (!dateRange.from || !dateRange.to || !data) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.month_year);
      return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
    });
  }, [dateRange]);
  
  // These filtered values are now defined before they're used
  const filteredKpiData = useMemo(() => filterDataByDateRange(kpiData || []), [kpiData, filterDataByDateRange]);
  const filteredRetention = useMemo(() => 
    filterDataByDateRange(retention || [])
      .filter(item => item?.retention_rate !== null && !isNaN(item?.retention_rate)),
    [retention, filterDataByDateRange]
  );
  
  // Log detailed debug info when retention data changes
  useEffect(() => {
    console.log('DEBUG BusinessKpis: Retention data received:', retention);
    console.log('DEBUG BusinessKpis: Average retention from hook:', avgRetention);
    
    // Check if there's any retention data at all
    if (!retention || retention.length === 0) {
      console.log('DEBUG BusinessKpis: No retention data available');
    } else {
      // Check if there's valid retention rates
      const validRates = retention.filter(item => 
        item.retention_rate !== null && !isNaN(item.retention_rate)
      );
      
      console.log(`DEBUG BusinessKpis: Found ${validRates.length} out of ${retention.length} entries with valid retention rates`);
      
      if (validRates.length > 0) {
        console.log('DEBUG BusinessKpis: Valid retention rates:', 
          validRates.map(item => ({
            month: item.month_year,
            rate: item.retention_rate.toFixed(2) + '%'
          }))
        );
      }
    }
    
    // Format data for the retention chart - filter out null/N/A values
    const formattedRetentionData = filteredRetention
      .map(item => ({
        month: new Date(item.month_year).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
        'Retention Rate': item.retention_rate,
        'Growth Rate': item.growth_rate
      })) || [];
      
    setRetentionData(formattedRetentionData);
    
    // Extra debug for Chart data
    console.log('DEBUG BusinessKpis: Retention chart data:', formattedRetentionData);
    if (formattedRetentionData.length === 0) {
      console.log('DEBUG BusinessKpis: No data available for retention chart');
    }
  }, [retention, filteredRetention, avgRetention]);
  
  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-white p-2 border rounded-md shadow-md text-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {
              entry.name.includes('Revenue') || entry.name.includes('LTV') || entry.name === 'CAC' 
                ? formatCurrency(entry.value) 
                : entry.name.includes('Rate') || entry.name === 'Marketing ROI' 
                  ? formatPercent(entry.value) 
                  : entry.value
            }
          </p>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando métricas del negocio...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error al cargar los datos. Intente nuevamente más tarde.</p>
      </div>
    );
  }

  // Format data for the Revenue vs CAC chart
  const revenueVsCacData = filteredKpiData.map(item => ({
    month: new Date(item.month_year).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
    'Revenue': item.total_revenue,
    'CAC': metrics?.find(m => m.month_year === item.month_year)?.acquisition_cost_manual || 0
  })) || [];
  
  // Format data for the LTV chart
  const ltvData = ltv?.map(item => ({
    name: item.nombre_custodio.length > 15 
      ? `${item.nombre_custodio.substring(0, 15)}...` 
      : item.nombre_custodio,
    'LTV': item.estimated_ltv,
    'Total Revenue': item.total_revenue,
  })).slice(0, 10) || [];
  
  // Get latest retention rate value - updated to handle null/N/A values
  const currentRetentionRate = (() => {
    if (filteredRetention && filteredRetention.length > 0) {
      // Find the last valid retention rate (not null, not NaN)
      for (let i = filteredRetention.length - 1; i >= 0; i--) {
        const rate = filteredRetention[i]?.retention_rate;
        if (rate !== null && !isNaN(rate)) {
          console.log('DEBUG BusinessKpis: Found latest valid retention rate:', rate);
          return rate;
        }
      }
      console.log('DEBUG BusinessKpis: No valid current retention rate found');
      return null;
    }
    console.log('DEBUG BusinessKpis: No filtered retention data available');
    return null;
  })();
    
  // Make sure we have a valid retention rate - preferring current rate over average
  // Fall back to avgRetention if currentRetentionRate is null
  const displayRetentionRate = (() => {
    if (currentRetentionRate !== null && !isNaN(currentRetentionRate)) {
      console.log('DEBUG BusinessKpis: Using current retention rate for display:', currentRetentionRate);
      return currentRetentionRate;
    }
    
    if (avgRetention !== null && !isNaN(avgRetention)) {
      console.log('DEBUG BusinessKpis: Using average retention rate for display:', avgRetention);
      return avgRetention;
    }
    
    console.log('DEBUG BusinessKpis: No valid retention rate available for display');
    return null;
  })();
  
  return (
    <div className="space-y-6">
      {/* Enhanced date range and comparison filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Periodo:</span>
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Comparar con:</span>
          </div>
          <Select value={comparisonType} onValueChange={(value) => setComparisonType(value as "month" | "year")}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mes anterior</SelectItem>
              <SelectItem value="year">Año anterior</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Top KPI cards with trend indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Suma de todos los ingresos generados por servicios de custodios en el período seleccionado, excluyendo servicios cancelados. Calculado como la suma del campo 'cobro_cliente' de la tabla de servicios.">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(filteredKpiData.reduce((sum, item) => sum + item.total_revenue, 0) || 0)}
                  </span>
                </div>
                {previousPeriodData?.totalRevenue !== undefined && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">vs. periodo anterior</span>
                    <TrendIndicator 
                      value={((filteredKpiData.reduce((sum, item) => sum + item.total_revenue, 0) - previousPeriodData.totalRevenue) / previousPeriodData.totalRevenue) * 100} 
                    />
                  </div>
                )}
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Custodios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Número de custodios únicos que han realizado al menos un servicio en el período seleccionado, excluyendo servicios cancelados. Calculado como el conteo distintivo de 'nombre_custodio' en la tabla de servicios.">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">
                    {filteredKpiData.length > 0 ? filteredKpiData[filteredKpiData.length-1]?.total_custodios || 0 : 0}
                  </span>
                </div>
                {previousPeriodData?.totalCustodios !== undefined && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">vs. periodo anterior</span>
                    <TrendIndicator 
                      value={((filteredKpiData.length > 0 ? filteredKpiData[filteredKpiData.length-1]?.total_custodios || 0 : 0) - previousPeriodData.totalCustodios) / previousPeriodData.totalCustodios * 100} 
                    />
                  </div>
                )}
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Costo de Adquisición (CAC)</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Costo promedio para adquirir un nuevo custodio. Calculado como la suma de costos de marketing, personal y otros activos, dividido por el número de nuevos custodios en el período.">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(cac)}
                  </span>
                </div>
                {previousPeriodData?.cac !== undefined && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">vs. periodo anterior</span>
                    <TrendIndicator 
                      value={-1 * ((cac - previousPeriodData.cac) / previousPeriodData.cac * 100)} 
                    />
                  </div>
                )}
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Valor de Vida del Cliente (LTV)</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Valor total estimado que un custodio genera durante toda su relación con la empresa. Calculado como el promedio de ingresos generados por un custodio, desde su primer servicio hasta su último servicio registrado.">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(avgLtv)}
                  </span>
                </div>
                {previousPeriodData?.avgLtv !== undefined && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">vs. periodo anterior</span>
                    <TrendIndicator 
                      value={(avgLtv - previousPeriodData.avgLtv) / previousPeriodData.avgLtv * 100} 
                    />
                  </div>
                )}
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tasa de Retención</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Porcentaje de custodios que continúan trabajando con la empresa de un mes al siguiente. Calculado como el número de custodios activos presentes tanto en el mes actual como en el mes anterior, dividido por el número total de custodios activos en el mes anterior.">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5 text-cyan-500" />
                  <span className="text-2xl font-bold">
                    {(displayRetentionRate !== null && !isNaN(displayRetentionRate)) 
                      ? formatPercent(displayRetentionRate) 
                      : 'N/A'}
                  </span>
                </div>
                {previousPeriodData?.avgRetention !== undefined && displayRetentionRate !== null && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">vs. periodo anterior</span>
                    <TrendIndicator 
                      value={(displayRetentionRate - previousPeriodData.avgRetention)} 
                      suffix=" pp"
                    />
                  </div>
                )}
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Net Promoter Score - Métrica que mide la lealtad y satisfacción de los custodios. Calculado como % Promotores - % Detractores.">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">
                    {nps}
                  </span>
                </div>
                {previousPeriodData?.nps !== undefined && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">vs. periodo anterior</span>
                    <TrendIndicator 
                      value={nps - previousPeriodData.nps} 
                      suffix=" pts"
                    />
                  </div>
                )}
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">ROI de Marketing</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Retorno de inversión en campañas de marketing. Calculado como (Ingresos - Costos) / Costos, expresado en porcentaje.">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-rose-500" />
                  <span className="text-2xl font-bold">
                    {formatPercent(marketingRoi)}
                  </span>
                </div>
                {previousPeriodData?.marketingRoi !== undefined && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">vs. periodo anterior</span>
                    <TrendIndicator 
                      value={marketingRoi - previousPeriodData.marketingRoi} 
                      suffix=" pp"
                    />
                  </div>
                )}
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ratio LTV:CAC</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Relación entre el Valor de Vida del Cliente y el Costo de Adquisición. Un buen ratio debe ser 3:1 o superior, indicando una buena rentabilidad en la adquisición de custodios.">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  <span className="text-2xl font-bold">
                    {ltvCacRatio.toFixed(1)}:1
                  </span>
                </div>
                {previousPeriodData?.ltvCacRatio !== undefined && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">vs. periodo anterior</span>
                    <TrendIndicator 
                      value={(ltvCacRatio - previousPeriodData.ltvCacRatio) / previousPeriodData.ltvCacRatio * 100} 
                    />
                  </div>
                )}
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and data entry tabs */}
      <Tabs defaultValue="charts">
        <TabsList className="bg-muted/30 p-1">
          <TabsTrigger value="charts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Gráficas</TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Ingresar Datos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Ingresos vs CAC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartLineChart data={revenueVsCacData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="CAC" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                    </RechartLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <LineChart className="h-4 w-4 mr-2 text-primary" />
                  Retención de Custodios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  {retentionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartLineChart data={retentionData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} />
                        <YAxis 
                          domain={[0, 100]} 
                          tickFormatter={(value) => `${value}%`} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="Retention Rate" stroke="#0EA5E9" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Growth Rate" stroke="#F43F5E" strokeWidth={2} dot={{ r: 4 }} />
                      </RechartLineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-lg p-6">
                      <div className="text-amber-500 bg-amber-50 p-3 rounded-full mb-3">
                        <Activity className="h-6 w-6" />
                      </div>
                      <p className="text-muted-foreground text-center font-medium mb-2">No hay datos suficientes de retención</p>
                      <p className="text-sm text-muted-foreground text-center max-w-xs">
                        Asegúrate de tener al menos 2 meses de datos de servicios con custodios activos para calcular la retención.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2 border shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                  Top 10 Custodios por LTV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ltvData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="LTV" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Total Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="data">
          <Card className="border shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Métricas Manuales</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsForm 
                metrics={metrics?.slice(-1)[0]} 
                onSave={updateMetrics} 
                isLoading={isUpdating} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Retention rate explanation card */}
      {retentionData.length === 0 && (
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-blue-700">Análisis de Retención</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-blue-700">
              <p>La tasa de retención no se está calculando debido a una de estas causas:</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>No hay suficientes meses de datos (necesitamos al menos 2 meses consecutivos con servicios)</li>
                <li>El nombre de los custodios podría tener inconsistencias entre meses, dificultando el seguimiento</li>
                <li>No hay custodios que aparezcan en meses consecutivos</li>
              </ol>
              <p>Recomendaciones:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Verifica que los nombres de custodios estén escritos de manera consistente</li>
                <li>Amplia el rango de fechas para incluir más meses de datos</li>
                <li>Asegúrate que la tabla 'servicios_custodia' tiene registros con el campo 'nombre_custodio' correctamente lleno</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
