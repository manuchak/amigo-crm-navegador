
import { DateRange } from "react-day-picker";
import { ServiciosMetricData } from "./types";
import { fetchServiciosRawData } from "./services/dataFetcher";
import { processServiciosMetrics } from "./services/metricsProcessor";
import { getMockServiciosData } from "./mockDataService";

/**
 * Main service for fetching and processing servicios data
 * @param dateRange Primary date range 
 * @param comparisonRange Optional comparison date range
 * @returns Promise with services metric data
 */
export async function fetchServiciosData(dateRange?: DateRange, comparisonRange?: DateRange): Promise<ServiciosMetricData> {
  try {
    // Validate date range
    if (!dateRange || !dateRange.from || !dateRange.to) {
      throw new Error('Invalid date range provided');
    }
    
    // Fetch raw data from database
    const rawData = await fetchServiciosRawData(dateRange);
    
    // Check if we have actual data
    if (!rawData.serviciosData || rawData.serviciosData.length === 0) {
      console.warn("No service data found in database for the date range, using mock data as fallback");
      return getMockServiciosData(dateRange);
    }

    // Process the data into metrics
    const processedData = processServiciosMetrics(rawData);
    
    console.log("Successfully processed data from servicios_custodia table");
    return processedData;
    
  } catch (error) {
    console.error("Error fetching servicios data:", error);
    console.log("Falling back to mock data due to error");
    return getMockServiciosData(dateRange);
  }
}
