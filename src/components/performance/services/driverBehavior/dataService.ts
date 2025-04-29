
import { DateRange } from "react-day-picker";
import { DriverBehaviorData, DriverBehaviorFilters } from "../../types/driver-behavior.types";
import { supabase } from "@/integrations/supabase/client";
import { createEmptyDriverBehaviorData, processDriverBehaviorData } from "./processors/dataProcessor";

// Fetch driver behavior data with optional filters
export const fetchDriverBehaviorData = async (dateRange: DateRange, filters?: DriverBehaviorFilters): Promise<DriverBehaviorData> => {
  console.log("Fetching driver behavior data with filters:", filters);
  console.log("Date range:", dateRange ? {
    from: dateRange.from ? dateRange.from.toISOString() : null,
    to: dateRange.to ? dateRange.to.toISOString() : null
  } : 'No date range provided');
  
  if (!dateRange.from || !dateRange.to) {
    console.warn("Invalid date range provided");
    return createEmptyDriverBehaviorData();
  }
  
  try {
    let query = supabase
      .from('driver_behavior_scores')
      .select('*');
    
    // Apply date range filter - records must overlap with the selected date range
    // A record overlaps if:
    // 1. Its start date is within the selected range, OR
    // 2. Its end date is within the selected range, OR
    // 3. It completely spans the selected range (starts before and ends after)
    const fromDate = dateRange.from.toISOString();
    const toDate = dateRange.to.toISOString();
    
    query = query.or(
      `start_date.lte.${toDate},end_date.gte.${fromDate}`
    );
    
    // Apply client filter if provided
    if (filters?.selectedClients && filters.selectedClients.length > 0) {
      query = query.in('client', filters.selectedClients);
    }
    
    // Apply driver name filter if provided
    if (filters?.driverName && filters.driverName.trim() !== '') {
      query = query.ilike('driver_name', `%${filters.driverName.trim()}%`);
    }
    
    // Execute the query
    const { data: driverScores, error } = await query;
    
    if (error) {
      console.error("Error fetching driver behavior data:", error);
      return createEmptyDriverBehaviorData();
    }
    
    if (!driverScores || driverScores.length === 0) {
      console.log("No driver behavior data found with applied filters");
      return createEmptyDriverBehaviorData();
    }
    
    console.log(`Found ${driverScores.length} driver behavior records`);
    if (driverScores.length > 0) {
      console.log("Sample record:", {
        driver: driverScores[0].driver_name,
        score: driverScores[0].score,
        period: `${new Date(driverScores[0].start_date).toLocaleDateString()} - ${new Date(driverScores[0].end_date).toLocaleDateString()}`
      });
    }
    
    // Process the data to create the DriverBehaviorData structure
    return processDriverBehaviorData(driverScores);
    
  } catch (err) {
    console.error("Exception when fetching driver data:", err);
    return createEmptyDriverBehaviorData();
  }
};

// Fetch client list for filtering
export const fetchClientList = async (): Promise<string[]> => {
  console.log("Fetching client list");
  
  try {
    const { data, error } = await supabase
      .from('driver_behavior_scores')
      .select('client')
      .order('client')
      .limit(100);
    
    if (error) {
      console.error("Error fetching client list:", error);
      return [];
    }
    
    if (data && data.length > 0) {
      // Extract unique client names
      const uniqueClients = Array.from(new Set(data.map(item => item.client))).filter(Boolean) as string[];
      console.log(`Found ${uniqueClients.length} unique clients`);
      return uniqueClients.sort();
    } else {
      console.log("No client data found");
      return [];
    }
  } catch (err) {
    console.error("Exception when fetching client list:", err);
    return [];
  }
};
