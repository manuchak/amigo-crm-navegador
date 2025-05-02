
import { Lead } from "@/context/LeadsContext";

// Array of status colors for different stages
export const statusColors = ["#2563eb", "#f59e42", "#16a34a", "#8957e5"];
export const statusTextColor = ["text-blue-600", "text-amber-600", "text-green-600", "text-purple-600"];

// Array of colors for pie chart
export const pieColors = ["#2563eb", "#f59e42", "#16a34a", "#8957e5", "#ef4444", "#8b5cf6"];

export const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// Hook to calculate average time metrics for each stage
export const useTimeMetrics = (leads: Lead[]) => {
  // In a real implementation, this would calculate the actual time spent in each stage
  // For now, we're returning mock data
  return [
    { name: 'nuevo', displayName: 'Nuevo', avgDays: 3.5 },
    { name: 'contactado', displayName: 'Contactado', avgDays: 5.2 },
    { name: 'calificado', displayName: 'Calificado', avgDays: 2.8 },
    { name: 'contratado', displayName: 'Contratado', avgDays: 1.5 }
  ];
};
