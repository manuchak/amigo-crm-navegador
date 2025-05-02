import { Lead } from "@/context/LeadsContext";

export const STAGES = [
  { key: 'new', label: 'Nuevos' },
  { key: 'contacted', label: 'Contactados' },
  { key: 'qualified', label: 'Calificados' },
  { key: 'hired', label: 'Contratados' },
];

export const statusTextColor = [
  'text-blue-600',
  'text-amber-600',
  'text-emerald-600',
  'text-indigo-600',
];

// Add the missing pieColors array for the ProfilePieChart
export const pieColors = [
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
];

interface MonthlyData {
  name: string;
  Nuevos: number;
  Calificados: number;
}

export const getMonthlyTrend = (leads: Lead[]): MonthlyData[] => {
  const monthlyData: { [key: string]: MonthlyData } = {};

  leads.forEach(lead => {
    const monthYear = new Date(lead.fechaCreacion).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { name: monthYear, Nuevos: 0, Calificados: 0 };
    }

    if (lead.estado === 'Nuevo') {
      monthlyData[monthYear].Nuevos++;
    } else if (lead.estado === 'Calificado') {
      monthlyData[monthYear].Calificados++;
    }
  });

  return Object.values(monthlyData).sort((a, b) => {
    const [monthA, yearA] = a.name.split(' ');
    const [monthB, yearB] = b.name.split(' ');
    const dateA = new Date(`${monthA} 1, ${yearA}`);
    const dateB = new Date(`${monthB} 1, ${yearB}`);
    return dateA.getTime() - dateB.getTime();
  });
};

interface TimeMetric {
  name: string;
  avgDays: number;
}

export const useTimeMetrics = (leads: Lead[]): TimeMetric[] => {
  const stageTimes: { [key: string]: { total: number; count: number } } = {};

  leads.forEach(lead => {
    const creationDate = new Date(lead.fechaCreacion);
    
    // Calcular la diferencia en días desde la creación hasta ahora
    const diffInDays = (new Date().getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
    
    const stage = lead.estado.toLowerCase();
    if (!stageTimes[stage]) {
      stageTimes[stage] = { total: 0, count: 0 };
    }
    stageTimes[stage].total += diffInDays;
    stageTimes[stage].count++;
  });

  return Object.entries(stageTimes).map(([stage, data]) => ({
    name: stage,
    avgDays: data.count > 0 ? data.total / data.count : 0,
  }));
};

// Format currency for display
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format percentage for display
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

function getColorForStage(stageKey: string): string {
  switch (stageKey) {
    case 'new': return '#3b82f6'; // blue-500
    case 'contacted': return '#f59e0b'; // amber-500
    case 'qualified': return '#10b981'; // emerald-500
    case 'hired': return '#6366f1'; // indigo-500
    default: return '#64748b'; // slate-500
  }
}

// Updated utility function to map lead data to funnel stages with improved calculations
export function useFunnelStats(leads: any[]) {
  const statuses = {
    new: leads.filter(lead => lead.estado === 'Nuevo').length,
    contacted: leads.filter(lead => lead.estado === 'Contactado').length,
    qualified: leads.filter(lead => lead.estado === 'Calificado').length,
    hired: leads.filter(lead => lead.estado === 'Contratado').length,
  };

  const byStage = STAGES.map(stage => ({
    key: stage.key,
    label: stage.label,
    value: statuses[stage.key as keyof typeof statuses],
    color: getColorForStage(stage.key),
  }));

  const conversions = [
    statuses.new > 0 ? (statuses.contacted / statuses.new) * 100 : null,
    statuses.contacted > 0 ? (statuses.qualified / statuses.contacted) * 100 : null,
    statuses.qualified > 0 ? (statuses.hired / statuses.qualified) * 100 : null,
  ];

  return { byStage, conversions };
}
