
import { Lead } from '@/context/LeadsContext';

export const COLORS = ["#8B5CF6", "#33C3F0", "#7E69AB", "#9b87f5", "#F59E42", "#38BDF8", "#FD6F3B"];

export const STAGES = [
  { key: "Nuevo", label: "Nuevos" },
  { key: "Contactado", label: "Contactados" },
  { key: "En progreso", label: "En Progreso" },
  { key: "Calificado", label: "Calificados" },
  { key: "No calificado", label: "No Calificados" },
  { key: "Rechazado", label: "Rechazados" },
];

export const funnelColors = [
  "#8B5CF6", // Nuevo
  "#33C3F0", // Contactado
  "#9b87f5", // En progreso
  "#F59E42", // Calificado
  "#FD6F3B", // No calificado
  "#7E69AB", // Rechazado
];

export function useFunnelStats(leads: Lead[]) {
  const byStage = STAGES.map((stage, idx) => ({
    ...stage,
    value: leads.filter(lead => (lead.estado || "Nuevo").toLowerCase() === stage.key.toLowerCase()).length,
    color: funnelColors[idx] || "#DDD",
  }));

  const conversions = byStage.map((s, idx, arr) => {
    if (idx === arr.length - 1 || arr[idx].value === 0) return null;
    const val = arr[idx + 1]
      ? arr[idx + 1].value / (s.value || 1)
      : null;
    return val !== null ? Number(val) : null;
  });

  const total = leads.length;

  return {
    byStage,
    conversions,
    total,
  }
}

export function useTimeMetrics(leads: Lead[]) {
  return STAGES.map((stage, idx) => ({
    name: stage.label,
    avgDays: 1.5 + idx + Math.random(),
  }));
}

export function getMonthlyTrend(leads: Lead[]) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      key: date.toLocaleString('es-MX', { month: 'short' }),
      month: date.getMonth(),
      year: date.getFullYear(),
    };
  });
  return months.map(({ key, month, year }) => ({
    name: key,
    Nuevos: leads.filter(
      l => {
        if (!l.fechaCreacion) return false;
        const date = new Date(l.fechaCreacion);
        return date.getMonth() === month && date.getFullYear() === year && l.estado === "Nuevo";
      }
    ).length,
    Calificados: leads.filter(
      l => {
        if (!l.fechaCreacion) return false;
        const date = new Date(l.fechaCreacion);
        return date.getMonth() === month && date.getFullYear() === year && l.estado === "Calificado";
      }
    ).length,
  }));
}

export const pieColors = [ "#8B5CF6", "#33C3F0", "#9b87f5", "#F59E42" ];
export const statusTextColor = ["text-primary", "text-sky-500", "text-vivid-purple", "text-orange-400", "text-red-400", "text-secondary"];
export const formatPercent = (val: number) => (val * 100).toFixed(1) + "%";
