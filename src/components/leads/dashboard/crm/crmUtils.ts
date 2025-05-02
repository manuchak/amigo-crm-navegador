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
  date: Date;
}

export const getMonthlyTrend = (leads: Lead[]): MonthlyData[] => {
  const monthlyData: { [key: string]: MonthlyData } = {};

  leads.forEach(lead => {
    const date = new Date(lead.fechaCreacion);
    // Format for display but keep the full date object for sorting
    const monthYear = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { 
        name: monthYear, 
        Nuevos: 0, 
        Calificados: 0,
        date: date 
      };
    }

    if (lead.estado === 'Nuevo') {
      monthlyData[monthYear].Nuevos++;
    } else if (lead.estado === 'Calificado') {
      monthlyData[monthYear].Calificados++;
    }
  });

  // Sort by date in ascending order
  return Object.values(monthlyData).sort((a, b) => {
    return a.date.getTime() - b.date.getTime();
  });
};

interface TimeMetric {
  name: string;
  avgDays: number;
}

// Completely revised time metrics calculation to ensure proper status display and no negative values
export const useTimeMetrics = (leads: Lead[]): TimeMetric[] => {
  // Define our expected statuses with their display names
  const expectedStatuses = {
    'nuevo': 'Nuevo',
    'contactado': 'Contactado', 
    'calificado': 'Calificado',
    'contratado': 'Contratado'
  };
  
  // Initialize tracking for each status with zero values
  const statusTimes: { [key: string]: { total: number; count: number } } = {
    'nuevo': { total: 0, count: 0 },
    'contactado': { total: 0, count: 0 },
    'calificado': { total: 0, count: 0 },
    'contratado': { total: 0, count: 0 }
  };
  
  // Process each lead
  leads.forEach(lead => {
    if (!lead.fechaCreacion) return; // Skip leads without creation date
    
    const creationDate = new Date(lead.fechaCreacion);
    const now = new Date();
    
    // Calculate positive days since creation
    const daysSinceCreation = Math.max(0, (now.getTime() - creationDate.getTime()) / (1000 * 3600 * 24));
    
    // Map the Spanish status name to our standardized key
    const statusKey = lead.estado === 'Nuevo' ? 'nuevo' : 
                     lead.estado === 'Contactado' ? 'contactado' :
                     lead.estado === 'Calificado' ? 'calificado' :
                     lead.estado === 'Contratados' ? 'contratado' : 
                     lead.estado.toLowerCase();
    
    // Only process if it's one of our expected statuses
    if (statusTimes[statusKey]) {
      statusTimes[statusKey].total += daysSinceCreation;
      statusTimes[statusKey].count += 1;
    }
  });
  
  // Create the final array with proper display names and rounded average values
  return Object.entries(statusTimes)
    .filter(([_, data]) => data.count > 0) // Only include statuses that have at least one lead
    .map(([status, data]) => ({
      name: status,
      avgDays: data.count > 0 ? Math.max(0, Math.round((data.total / data.count) * 10) / 10) : 0
    }))
    .sort((a, b) => { // Sort by status in a logical flow order
      const order = ['nuevo', 'contactado', 'calificado', 'contratado'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });
};

// Format currency for display with enhanced formatting
export const formatCurrency = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  // Add abbreviations for large numbers
  if (value >= 1000000) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    }).format(value / 1000000) + 'M';
  } 
  else if (value >= 1000) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(value / 1000) + 'K';
  }
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format percentage for display - updated to handle null, undefined, and NaN values
export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  return new Intl.NumberFormat('es-MX', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

// Format number with thousands separator
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  // Add abbreviations for large numbers
  if (value >= 1000000) {
    return new Intl.NumberFormat('es-MX', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    }).format(value / 1000000) + 'M';
  } 
  else if (value >= 1000) {
    return new Intl.NumberFormat('es-MX', {
      maximumFractionDigits: 1
    }).format(value / 1000) + 'K';
  }
  
  return new Intl.NumberFormat('es-MX').format(value);
};

// Get color based on trend direction and strength
export const getTrendColor = (value: number): string => {
  if (isNaN(value) || value === 0) return 'text-gray-500';
  
  if (value > 15) return 'text-emerald-600';
  if (value > 0) return 'text-green-500';
  if (value > -15) return 'text-amber-500';
  return 'text-red-500';
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
export function useFunnelStats(leads: any[], contactedCount?: number) {
  const statuses = {
    new: leads.filter(lead => lead.estado === 'Nuevo').length,
    // Use the contactedCount from the context if provided, otherwise fallback to filtering leads
    contacted: contactedCount !== undefined ? contactedCount : leads.filter(lead => lead.estado === 'Contactado').length,
    qualified: leads.filter(lead => lead.estado === 'Calificado').length,
    hired: leads.filter(lead => lead.estado === 'Contratados').length,
  };

  // Calculate total leads for percentage
  const totalLeads = leads.length; // Use the total leads count directly

  const byStage = STAGES.map(stage => {
    const stageValue = statuses[stage.key as keyof typeof statuses];
    // Calculate percentage based on total leads count
    const percentageOfTotal = (stageValue / totalLeads) * 100;
    
    return {
      key: stage.key,
      label: stage.label,
      value: stageValue,
      color: getColorForStage(stage.key),
      percentage: stage.key === 'new' ? percentageOfTotal : undefined,
    };
  });

  const conversions = [
    statuses.new > 0 ? (statuses.contacted / statuses.new) * 100 : null,
    statuses.contacted > 0 ? (statuses.qualified / statuses.contacted) * 100 : null,
    statuses.qualified > 0 ? (statuses.hired / statuses.qualified) * 100 : null,
  ];

  return { byStage, conversions };
}

// Calculate retention rate between two periods - enhanced to handle null values
export function calculateRetentionRate(previousPeriodCustodians: string[], currentPeriodCustodians: string[]): number {
  if (!previousPeriodCustodians || previousPeriodCustodians.length === 0) return 0;
  
  // Count custodians that appear in both arrays (retained)
  const retained = previousPeriodCustodians.filter(custodian => 
    custodian && currentPeriodCustodians.includes(custodian)
  );
  
  // Calculate retention rate as percentage
  return (retained.length / previousPeriodCustodians.length) * 100;
}

// Helper to format date for display
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get month name from date
export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString('es-MX', { month: 'long' });
};

// Get short date range string
export const getShortDateRangeString = (from: Date, to: Date): string => {
  const fromStr = from.toLocaleDateString('es-MX', {day: 'numeric', month: 'short'});
  const toStr = to.toLocaleDateString('es-MX', {day: 'numeric', month: 'short', year: 'numeric'});
  return `${fromStr} - ${toStr}`;
};
