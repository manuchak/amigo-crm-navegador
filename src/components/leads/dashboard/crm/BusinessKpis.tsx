
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, AlertCircle } from 'lucide-react';

// Componente para KPIs de negocio, con enfoque en visualización estilo Apple
export const BusinessKpis: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  
  // Datos de KPIs de ejemplo
  const kpiData = {
    month: {
      capturacionLeads: { value: 250, change: 8.3 },
      tasaConversion: { value: 6.5, change: -1.2 },
      clientesNuevos: { value: 18, change: 12.5 },
      ingresoPromedio: { value: 15400, change: 5.2 },
      costoAdquisicion: { value: 1200, change: -3.5 },
      retencion: { value: 85, change: 2.1 }
    },
    quarter: {
      capturacionLeads: { value: 780, change: 12.7 },
      tasaConversion: { value: 5.8, change: 0.8 },
      clientesNuevos: { value: 45, change: 15.3 },
      ingresoPromedio: { value: 48200, change: 7.9 },
      costoAdquisicion: { value: 1150, change: -5.2 },
      retencion: { value: 83, change: 1.4 }
    },
    year: {
      capturacionLeads: { value: 3250, change: 23.5 },
      tasaConversion: { value: 6.2, change: 4.5 },
      clientesNuevos: { value: 186, change: 18.7 },
      ingresoPromedio: { value: 195000, change: 12.8 },
      costoAdquisicion: { value: 1050, change: -8.4 },
      retencion: { value: 87, change: 3.2 }
    }
  };

  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Indicadores de Negocio</h2>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as 'month' | 'quarter' | 'year')} className="w-auto">
          <TabsList className="bg-slate-100/70 p-1 rounded-lg">
            <TabsTrigger value="month" className="rounded-md text-xs">Mes</TabsTrigger>
            <TabsTrigger value="quarter" className="rounded-md text-xs">Trimestre</TabsTrigger>
            <TabsTrigger value="year" className="rounded-md text-xs">Año</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Capturación de Leads"
          value={kpiData[period].capturacionLeads.value}
          change={kpiData[period].capturacionLeads.change}
          format="number"
          suffix="leads"
          icon={<Users className="h-5 w-5" />}
        />
        
        <KpiCard
          title="Tasa de Conversión"
          value={kpiData[period].tasaConversion.value}
          change={kpiData[period].tasaConversion.change}
          format="percent"
          icon={<Activity className="h-5 w-5" />}
        />
        
        <KpiCard
          title="Nuevos Clientes"
          value={kpiData[period].clientesNuevos.value}
          change={kpiData[period].clientesNuevos.change}
          format="number"
          suffix="clientes"
          icon={<Users className="h-5 w-5" />}
        />
        
        <KpiCard
          title="Ingreso Promedio"
          value={kpiData[period].ingresoPromedio.value}
          change={kpiData[period].ingresoPromedio.change}
          format="currency"
          icon={<DollarSign className="h-5 w-5" />}
        />
        
        <KpiCard
          title="Costo de Adquisición"
          value={kpiData[period].costoAdquisicion.value}
          change={kpiData[period].costoAdquisicion.change}
          format="currency"
          icon={<AlertCircle className="h-5 w-5" />}
          invertTrend
        />
        
        <KpiCard
          title="Retención de Clientes"
          value={kpiData[period].retencion.value}
          change={kpiData[period].retencion.change}
          format="percent"
          icon={<Users className="h-5 w-5" />}
        />
      </div>
    </div>
  );
};

interface KpiCardProps {
  title: string;
  value: number;
  change: number;
  format: 'number' | 'percent' | 'currency';
  suffix?: string;
  icon?: React.ReactNode;
  invertTrend?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  change, 
  format, 
  suffix,
  icon,
  invertTrend = false
}) => {
  // Formatea el valor según el tipo especificado
  const formattedValue = () => {
    switch (format) {
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 0,
        }).format(value);
      default:
        return value.toLocaleString();
    }
  };

  // Determina si el trend es positivo o negativo, teniendo en cuenta invertTrend
  const isPositiveTrend = invertTrend ? change < 0 : change > 0;
  
  return (
    <Card className="border border-gray-100 shadow-sm bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-500 font-medium">{title}</div>
          <div className="bg-gray-100 p-1.5 rounded-full">
            {icon}
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold">
            {formattedValue()} {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
          </div>
          
          <div className={`flex items-center text-sm ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveTrend ? 
              <TrendingUp className="h-4 w-4 mr-1" /> : 
              <TrendingDown className="h-4 w-4 mr-1" />
            }
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
