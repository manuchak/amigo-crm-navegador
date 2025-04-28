
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { CustodioPerformanceData } from "../types/performance.types";
import { fetchExcelData } from "../services/performanceDataService";
import { processExcelData } from "../utils/dataProcessor";

export function useCustodioPerformanceData(dateRange: DateRange, comparisonRange?: DateRange) {
  return useQuery({
    queryKey: ['custodio-performance-data', dateRange, comparisonRange],
    queryFn: async (): Promise<CustodioPerformanceData> => {
      const jsonData = await fetchExcelData();
      return processExcelData(jsonData, dateRange);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
