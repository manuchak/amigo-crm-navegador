import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustodioKpi } from '@/hooks/useCustodioKpi';
import { CircleDollarSign, Users, Scale, TrendingUp, BarChart, LineChart } from 'lucide-react';
import { 
  ResponsiveContainer,
  AreaChart, 
  Area, 
  LineChart as RechartLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart as RechartBarChart,
  Bar,
  Legend
} from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function BusinessKpis() {
  const [months, setMonths] = useState(12);
  const { 
    kpiData, 
    metrics, 
    newCustodios, 
    retention, 
    ltv,
    isLoading, 
    isError,
    updateMetrics, 
    nps,
    cac,
    marketingRoi,
    avgRetention,
    avgLtv,
    ltvCacRatio
  } = useCustodioKpi(months);
  
  const [isMetricsDialogOpen, setIsMetricsDialogOpen] = useState(false);
  const [currentMetric, setCurrentMetric] = useState<any>({
    month_year: format(new Date(), 'yyyy-MM-01'),
    staff_cost: 0,
    asset_cost: 0,
    marketing_cost: 0,
    nps_promoters: 0,
    nps_neutral: 0,
    nps_detractors: 0,
    acquisition_cost_manual: 0,
    avg_onboarding_days: 0,
    campaign_name: '',
    campaign_cost: 0,
    campaign_revenue: 0
  });
  
  // Manejar el envío del formulario de métricas
  const handleMetricsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMetrics(currentMetric);
    setIsMetricsDialogOpen(false);
    toast.success('Métricas actualizadas correctamente');
  };
  
  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentMetric(prev => ({
      ...prev,
      [name]: name.includes('cost') || name.includes('revenue') || name.includes('days') ? 
        parseFloat(value) : value
    }));
  };
  
  // Función para formatear valores monetarios
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '$0';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };
  
  // Función para formatear porcentajes
  const formatPercent = (value?: number) => {
    if (value === undefined) return '0%';
    return `${value.toFixed(1)}%`;
  };

  // Custom tooltip components that don't use useChart directly
  const RevenueChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-background/95 p-2 border rounded-md shadow-md text-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name === "revenue" ? "Ingresos Totales" : "Promedio por Servicio"}: 
            {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };
  
  const RetentionChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-background/95 p-2 border rounded-md shadow-md text-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name === "activos" ? "Custodios Activos" : 
             entry.name === "nuevos" ? "Nuevos Custodios" :
             entry.name === "perdidos" ? "Custodios Perdidos" :
             "Tasa de Retención"}: 
            {entry.name === "retention" ? `${entry.value.toFixed(1)}%` : entry.value}
          </p>
        ))}
      </div>
    );
  };
  
  const EfficiencyChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-background/95 p-2 border rounded-md shadow-md text-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            Servicios por Custodio: {entry.value.toFixed(1)}
          </p>
        ))}
      </div>
    );
  };

  // Datos para gráficos
  const revenueData = kpiData?.map(month => ({
    name: format(parseISO(month.month_year), 'MMM yy', { locale: es }),
    revenue: month.total_revenue || 0,
    avg: month.avg_revenue_per_service || 0
  }));
  
  const custodioGrowthData = retention?.map(month => ({
    name: format(parseISO(month.month_year), 'MMM yy', { locale: es }),
    activos: month.active_end,
    nuevos: month.new_custodios,
    perdidos: month.lost_custodios,
    retention: month.retention_rate
  }));
  
  const averagesData = kpiData?.map(month => ({
    name: format(parseISO(month.month_year), 'MMM yy', { locale: es }),
    serviciosPorCustodio: month.avg_services_per_custodio || 0
  }));
  
  // Calcular cambio porcentual para los KPIs principales
  const calculateChange = (data?: any[], key?: string) => {
    if (!data || data.length < 2 || !key) return 0;
    
    const current = data[data.length - 1][key] || 0;
    const previous = data[data.length - 2][key] || 0;
    
    if (previous === 0) return 100; // Si el valor anterior era 0, el cambio es del 100%
    return ((current - previous) / previous) * 100;
  };
  
  const revenueChange = calculateChange(kpiData, 'total_revenue');
  const custodiosChange = calculateChange(retention, 'active_end');
  const ltvChange = ltv && ltv.length > 0 ? 
    ((ltv.reduce((sum, c) => sum + c.estimated_ltv, 0) / ltv.length) - avgLtv) / avgLtv * 100 : 0;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPIs de Negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPIs de Negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md text-red-600">
            Error al cargar los KPIs. Por favor, intente nuevamente más tarde.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">KPIs de Negocio</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsMetricsDialogOpen(true)}
          >
            Ingresar Métricas
          </Button>
          <select 
            className="border rounded-md px-3 py-2 text-sm"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
          >
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
            <option value={24}>24 meses</option>
          </select>
        </div>
      </div>
      
      {/* Tarjetas de KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(kpiData?.slice(-1)[0]?.total_revenue)}
                </p>
                <div className={`text-xs ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueChange >= 0 ? '↑' : '↓'} {Math.abs(revenueChange).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CircleDollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Custodios Activos</p>
                <p className="text-2xl font-bold">
                  {retention?.slice(-1)[0]?.active_end || 0}
                </p>
                <div className={`text-xs ${custodiosChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {custodiosChange >= 0 ? '↑' : '↓'} {Math.abs(custodiosChange).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">CAC</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(cac)}
                </p>
                <div className="text-xs text-muted-foreground">
                  Costo de adquisición
                </div>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Scale className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">LTV</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(avgLtv)}
                </p>
                <div className={`text-xs ${ltvChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ltvChange >= 0 ? '↑' : '↓'} {Math.abs(ltvChange).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Segunda fila de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">LTV:CAC</p>
                <p className="text-2xl font-bold">
                  {ltvCacRatio.toFixed(1)}
                </p>
                <div className={`text-xs ${ltvCacRatio >= 3 ? 'text-green-600' : ltvCacRatio >= 1 ? 'text-amber-600' : 'text-red-600'}`}>
                  {ltvCacRatio >= 3 ? 'Excelente' : ltvCacRatio >= 1 ? 'Aceptable' : 'Bajo'}
                </div>
              </div>
              <div className="p-2 bg-violet-500/10 rounded-full">
                <Scale className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Retención</p>
                <p className="text-2xl font-bold">
                  {formatPercent(avgRetention)}
                </p>
                <div className="text-xs text-muted-foreground">
                  Tasa de retención promedio
                </div>
              </div>
              <div className="p-2 bg-cyan-500/10 rounded-full">
                <Users className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">NPS</p>
                <p className="text-2xl font-bold">
                  {nps}
                </p>
                <div className={`text-xs ${nps >= 50 ? 'text-green-600' : nps >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                  {nps >= 50 ? 'Excelente' : nps >= 0 ? 'Aceptable' : 'Crítico'}
                </div>
              </div>
              <div className="p-2 bg-rose-500/10 rounded-full">
                <BarChart className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ROI Marketing</p>
                <p className="text-2xl font-bold">
                  {formatPercent(marketingRoi)}
                </p>
                <div className={`text-xs ${marketingRoi >= 100 ? 'text-green-600' : marketingRoi >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                  {marketingRoi >= 100 ? 'Excelente' : marketingRoi >= 0 ? 'Positivo' : 'Negativo'}
                </div>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-full">
                <LineChart className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="retention">Retención</TabsTrigger>
          <TabsTrigger value="efficiency">Eficiencia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<RevenueChartTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Ingresos Totales"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="avg"
                      name="Promedio por Servicio"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="retention" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Crecimiento y Retención</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart data={custodioGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<RetentionChartTooltip />} />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="activos"
                      name="Custodios Activos"
                      fill="#8884d8"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="nuevos"
                      name="Nuevos Custodios"
                      fill="#82ca9d"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="perdidos"
                      name="Custodios Perdidos"
                      fill="#ff8042"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="retention"
                      name="Tasa de Retención"
                      stroke="#ff7300"
                    />
                  </RechartBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="efficiency" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Eficiencia Operativa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartLineChart data={averagesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<EfficiencyChartTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="serviciosPorCustodio"
                      name="Servicios por Custodio"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </RechartLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para ingresar métricas manualmente */}
      <Dialog open={isMetricsDialogOpen} onOpenChange={setIsMetricsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ingresar Métricas Manuales</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            updateMetrics(currentMetric);
            setIsMetricsDialogOpen(false);
            toast.success('Métricas actualizadas correctamente');
          }} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="month_year">Mes</Label>
              <Input
                id="month_year"
                name="month_year"
                type="date"
                value={currentMetric.month_year}
                onChange={(e) => {
                  const { name, value } = e.target;
                  setCurrentMetric(prev => ({
                    ...prev,
                    [name]: value
                  }));
                }}
              />
              <p className="text-sm text-muted-foreground">Seleccione el primer día del mes</p>
            </div>
            
            <h4 className="font-medium text-sm pt-2 border-t">Costos de Adquisición</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff_cost">Costo de Personal</Label>
                <Input
                  id="staff_cost"
                  name="staff_cost"
                  type="number"
                  value={currentMetric.staff_cost}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCurrentMetric(prev => ({
                      ...prev,
                      [name]: parseFloat(value)
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_cost">Costo de Activos</Label>
                <Input
                  id="asset_cost"
                  name="asset_cost"
                  type="number"
                  value={currentMetric.asset_cost}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCurrentMetric(prev => ({
                      ...prev,
                      [name]: parseFloat(value)
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketing_cost">Costo de Marketing</Label>
                <Input
                  id="marketing_cost"
                  name="marketing_cost"
                  type="number"
                  value={currentMetric.marketing_cost}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCurrentMetric(prev => ({
                      ...prev,
                      [name]: parseFloat(value)
                    }));
                  }}
                />
              </div>
            </div>
            
            <h4 className="font-medium text-sm pt-2 border-t">Datos NPS</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nps_promoters">Promotores (9-10)</Label>
                <Input
                  id="nps_promoters"
                  name="nps_promoters"
                  type="number"
                  value={currentMetric.nps_promoters}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCurrentMetric(prev => ({
                      ...prev,
                      [name]: parseInt(value)
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nps_neutral">Neutros (7-8)</Label>
                <Input
                  id="nps_neutral"
                  name="nps_neutral"
                  type="number"
                  value={currentMetric.nps_neutral}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCurrentMetric(prev => ({
                      ...prev,
                      [name]: parseInt(value)
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nps_detractors">Detractores (0-6)</Label>
                <Input
                  id="nps_detractors"
                  name="nps_detractors"
                  type="number"
                  value={currentMetric.nps_detractors}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCurrentMetric(prev => ({
                      ...prev,
                      [name]: parseInt(value)
                    }));
                  }}
                />
              </div>
            </div>
            
            <h4 className="font-medium text-sm pt-2 border-t">Datos de Campaña</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_name">Nombre de Campaña</Label>
                <Input
                  id="campaign_name"
                  name="campaign_name"
                  type="text"
                  value={currentMetric.campaign_name || ''}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCurrentMetric(prev => ({
                      ...prev,
                      [name]: value
                    }));
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign_cost">Costo de Campaña</Label>
                  <Input
                    id="campaign_cost"
                    name="campaign_cost"
                    type="number"
                    value={currentMetric.campaign_cost}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setCurrentMetric(prev => ({
                        ...prev,
                        [name]: parseFloat(value)
                      }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign_revenue">Ingreso de Campaña</Label>
                  <Input
                    id="campaign_revenue"
                    name="campaign_revenue"
                    type="number"
                    value={currentMetric.campaign_revenue}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setCurrentMetric(prev => ({
                        ...prev,
                        [name]: parseFloat(value)
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
            
            <h4 className="font-medium text-sm pt-2 border-t">Otros Datos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acquisition_cost_manual">Costos de Adquisición Adicionales</Label>
                <Input
                  id="acquisition_cost_manual"
                  name="acquisition_cost_manual"
                  type="number"
                  value={currentMetric.acquisition_cost_manual}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCurrentMetric(prev => ({
                      ...prev,
                      [name]: parseFloat(value)
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avg_onboarding_days">Días Promedio de Onboarding</Label>
                <Input
                  id="avg_onboarding_days"
                  name="avg_onboarding_days"
                  type="number"
                  value={currentMetric.avg_onboarding_days}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCurrentMetric(prev => ({
                      ...prev,
                      [name]: parseFloat(value)
                    }));
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsMetricsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Métricas
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Badge de datos que requieren atención manual */}
      <div className="flex justify-end">
        <Badge variant="outline" className="text-xs font-normal">
          Algunos KPIs requieren datos manuales en "Ingresar Métricas"
        </Badge>
      </div>
    </div>
  );
}
