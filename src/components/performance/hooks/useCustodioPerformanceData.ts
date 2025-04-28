
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { CustodioPerformanceData } from "../types/performance.types";
import { fetchExcelData } from "../services/performanceDataService";
import { processExcelData } from "../utils/dataProcessor";

export function useCustodioPerformanceData(dateRange: DateRange, comparisonRange?: DateRange) {
  return useQuery({
    queryKey: ['custodio-performance-data', dateRange, comparisonRange],
    queryFn: async (): Promise<CustodioPerformanceData> => {
      try {
        console.log("Fetching custodio performance data with:", { dateRange, comparisonRange });
        
        // Make sure dateRange has valid dates
        if (!dateRange.from || !dateRange.to) {
          console.warn('Invalid date range provided to useCustodioPerformanceData');
          // Use a fallback range if needed
          const fallbackDateRange = {
            from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            to: new Date()
          };
          const jsonData = await fetchExcelData();
          return processExcelData(jsonData, fallbackDateRange);
        }
        
        // Fetch and process data with the provided date range
        const jsonData = await fetchExcelData();
        const result = processExcelData(jsonData, dateRange);
        
        console.log("Successfully processed custodio performance data");
        return result;
      } catch (error) {
        console.error('Error in useCustodioPerformanceData:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
