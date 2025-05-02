
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustodioKpi } from "@/hooks/useCustodioKpi";
import { Loader2, TrendingUp, Users, Wallet, BarChart3, LineChart, Activity, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart as RechartLineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, BarChart, Bar } from "recharts";
import { formatCurrency, formatPercent } from "./crmUtils";
import { MetricsForm } from "./MetricsForm";
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DateRangePicker from "./DateRangePicker";

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

export const BusinessKpis = () => {
  // Add date range state with default values (last 12 months)
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    to: new Date()
  });
  
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
    nps, cac, marketingRoi, avgRetention, avgLtv, ltvCacRatio 
  } = useCustodioKpi(calculateMonths()); // Get data based on selected date range
  
  // Filter data based on selected date range
  const filterDataByDateRange = (data: any[]) => {
    if (!dateRange.from || !dateRange.to || !data) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.month_year);
      return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
    });
  };
  
  const filteredKpiData = filterDataByDateRange(kpiData || []);
  const filteredRetention = filterDataByDateRange(retention || []);
  
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
  
  // Format data for the retention chart
  const retentionData = filteredRetention.map(item => ({
    month: new Date(item.month_year).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
    'Retention Rate': item.retention_rate,
    'Growth Rate': item.growth_rate
  })) || [];
  
  // Format data for the LTV chart
  const ltvData = ltv?.map(item => ({
    name: item.nombre_custodio.length > 15 
      ? `${item.nombre_custodio.substring(0, 15)}...` 
      : item.nombre_custodio,
    'LTV': item.estimated_ltv,
    'Total Revenue': item.total_revenue,
  })).slice(0, 10) || [];

  return (
    <div className="space-y-6">
      {/* Date range filter */}
      <div className="flex justify-end mb-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      
      {/* Top KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Suma de todos los ingresos generados por servicios de custodios en el período seleccionado. Calculado como la suma del campo 'cobro_cliente' de la tabla de servicios.">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <span className="text-2xl font-bold">
                  {formatCurrency(filteredKpiData.reduce((sum, item) => sum + item.total_revenue, 0) || 0)}
                </span>
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Custodios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Número de custodios únicos que han realizado al menos un servicio en el período seleccionado. Calculado como el conteo distintivo de 'nombre_custodio' en la tabla de servicios.">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  {filteredKpiData.length > 0 ? filteredKpiData[filteredKpiData.length-1]?.total_custodios || 0 : 0}
                </span>
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Costo de Adquisición (CAC)</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Costo promedio para adquirir un nuevo custodio. Calculado como la suma de costos de marketing, personal y otros activos, dividido por el número de nuevos custodios en el período.">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold">
                  {formatCurrency(cac)}
                </span>
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Valor de Vida del Cliente (LTV)</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Valor total estimado que un custodio genera durante toda su relación con la empresa. Calculado como el promedio de ingresos generados por un custodio, desde su primer servicio hasta su último servicio registrado.">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold">
                  {formatCurrency(avgLtv)}
                </span>
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tasa de Retención</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Porcentaje de custodios que continúan trabajando con la empresa de un período a otro. Calculado comparando custodios activos al inicio y al final del período seleccionado.">
              <div className="flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-cyan-500" />
                <span className="text-2xl font-bold">
                  {formatPercent(avgRetention)}
                </span>
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Net Promoter Score - Métrica que mide la lealtad y satisfacción de los custodios. Calculado como % Promotores - % Detractores.">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">
                  {nps}
                </span>
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">ROI de Marketing</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Retorno de inversión en campañas de marketing. Calculado como (Ingresos - Costos) / Costos, expresado en porcentaje.">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-rose-500" />
                <span className="text-2xl font-bold">
                  {formatPercent(marketingRoi)}
                </span>
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ratio LTV:CAC</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTooltip explanation="Relación entre el Valor de Vida del Cliente y el Costo de Adquisición. Un buen ratio debe ser 3:1 o superior, indicando una buena rentabilidad en la adquisición de custodios.">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                <span className="text-2xl font-bold">
                  {ltvCacRatio.toFixed(1)}:1
                </span>
              </div>
            </MetricTooltip>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and data entry tabs */}
      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Gráficas</TabsTrigger>
          <TabsTrigger value="data">Ingresar Datos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ingresos vs CAC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartLineChart data={revenueVsCacData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" />
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
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Retención de Custodios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartLineChart data={retentionData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="Retention Rate" stroke="#0EA5E9" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Growth Rate" stroke="#F43F5E" strokeWidth={2} dot={{ r: 4 }} />
                    </RechartLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top 10 Custodios por LTV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ltvData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="LTV" fill="#F59E0B" />
                      <Bar dataKey="Total Revenue" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Manuales</CardTitle>
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
    </div>
  );
};
