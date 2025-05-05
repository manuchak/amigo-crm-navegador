
import { DateRange, DateRangePreset } from "@/components/performance/filters/AdvancedDateRangePicker";
import { subDays, startOfMonth, endOfMonth } from "date-fns";

// Define presets for the date range picker
export const getDefaultDatePresets = (): DateRangePreset[] => [
  { 
    label: "Este mes", 
    value: "thisMonth",
    getDateRange: () => {
      const now = new Date();
      return {
        from: startOfMonth(now),
        to: endOfMonth(now)
      };
    }
  },
  { 
    label: "Mes anterior", 
    value: "lastMonth",
    getDateRange: () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth)
      };
    }
  },
  { 
    label: "Últimos 30 días", 
    value: "last30days",
    getDateRange: () => {
      return {
        from: subDays(new Date(), 29),
        to: new Date()
      };
    }
  },
  { 
    label: "Últimos 90 días", 
    value: "last90days",
    getDateRange: () => {
      return {
        from: subDays(new Date(), 89),
        to: new Date()
      };
    }
  }
];

// Initialize with the "last 30 days" preset for better performance
export const getInitialDateRange = () => ({
  primary: {
    from: subDays(new Date(), 29), // Start 30 days ago
    to: new Date(), // End today
  },
  comparisonType: 'none' as const,
  rangeType: 'last30days' as const
});
