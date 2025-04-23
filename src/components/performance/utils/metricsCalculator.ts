
import { CustodioData, PerformanceMetric } from "../types/performance.types";

export function calculateSummaryMetrics(custodios: CustodioData[]): PerformanceMetric[] {
  const activeCustodios = custodios.filter(c => c.status === 'active').length;
  const totalEarnings = custodios.reduce((sum, c) => sum + c.earnings, 0);
  const avgResponseTime = custodios.reduce((sum, c) => sum + c.responseTime, 0) / custodios.length;
  const retentionRate = (activeCustodios / custodios.length) * 100;

  return [
    {
      label: 'Total Custodios',
      value: custodios.length,
      change: 12,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Custodios activos en el período'
    },
    { 
      label: 'Validaciones',
      value: 3450,
      change: 5,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Total de validaciones en el período'
    },
    { 
      label: 'Tiempo Promedio de Respuesta',
      value: '4.2h',
      change: -15,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Tiempo promedio para responder llamadas'
    },
    { 
      label: 'Tasa de Retención',
      value: '85%',
      change: -2,
      changeLabel: 'vs. mes anterior',
      changeType: 'decrease',
      description: 'Retención de custodios activos'
    },
    { 
      label: 'Distancia Promedio',
      value: '12.5km',
      change: 0,
      changeLabel: 'vs. mes anterior',
      changeType: 'neutral',
      description: 'Distancia promedio recorrida'
    },
    { 
      label: 'Ingreso Promedio',
      value: '$12,450',
      change: 8,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Ingreso promedio por custodio'
    },
    { 
      label: 'LTV',
      value: '$85,300',
      change: 5,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Valor de vida del cliente'
    },
    { 
      label: 'Rotación',
      value: '12%',
      change: -3,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Tasa de rotación mensual'
    }
  ];
}

export function generatePerformanceTrends(): {
  date: string;
  completionRate: number;
  responseTime: number;
  reliability: number;
  quality: number;
  validations: number;
}[] {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    return {
      date: date.toISOString().split('T')[0],
      completionRate: 70 + Math.random() * 30,
      responseTime: 3 + Math.random() * 2,
      reliability: 3.5 + Math.random() * 1.5,
      quality: 3.7 + Math.random() * 1.3,
      validations: Math.floor(80 + Math.random() * 50)
    };
  }).reverse();
}

export function generateMonthlyRevenue(): { month: string; revenue: number }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear(),
      revenue: Math.floor(80000 + Math.random() * 50000)
    };
  });
}

export function generateMonthlyRetention(): { month: string; rate: number }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear(),
      rate: 75 + Math.random() * 20
    };
  });
}
