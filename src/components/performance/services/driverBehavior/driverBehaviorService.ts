
import { supabase } from "@/integrations/supabase/client";
import { DriverBehaviorScore, DriverBehaviorFilters } from "../../types/driver-behavior.types";
import { calculateScore } from "../../utils/scoreCalculator";
import { DateRange } from "react-day-picker";

/**
 * Fetch driver behavior scores with optional filters
 */
export async function fetchDriverBehaviorData(
  dateRange?: DateRange, 
  filters?: DriverBehaviorFilters
): Promise<DriverBehaviorScore[]> {
  let query = supabase
    .from('driver_behavior_scores')
    .select('*');
  
  // Apply date filters if provided
  if (dateRange?.from) {
    query = query.gte('start_date', dateRange.from.toISOString());
  }
  
  if (dateRange?.to) {
    query = query.lte('end_date', dateRange.to.toISOString());
  }
  
  // Apply additional filters if provided
  if (filters) {
    if (filters.driverName) {
      query = query.ilike('driver_name', `%${filters.driverName}%`);
    }
    
    if (filters.driverGroup) {
      query = query.eq('driver_group', filters.driverGroup);
    }
    
    if (filters.client) {
      query = query.ilike('client', `%${filters.client}%`);
    }
    
    if (filters.minScore !== undefined) {
      query = query.gte('score', filters.minScore);
    }
    
    if (filters.maxScore !== undefined) {
      query = query.lte('score', filters.maxScore);
    }
  }
  
  // Order by score ascending (worst scores first)
  query = query.order('score', { ascending: true });
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching driver behavior data:", error);
    throw error;
  }
  
  return data || [];
}

/**
 * Import driver behavior data
 * This function processes raw data and calculates scores before storing
 */
export async function importDriverBehaviorData(
  rawData: any[],
  progressCallback?: (status: string, processed: number, total: number) => void
): Promise<{ success: boolean; errors?: any[] }> {
  try {
    const errors: any[] = [];
    const totalRecords = rawData.length;
    
    // Process in batches of 50
    const batchSize = 50;
    const batches = Math.ceil(totalRecords / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, totalRecords);
      const batch = rawData.slice(start, end);
      
      // Process each record in the batch
      const processedBatch = batch.map((record, index) => {
        const currentIndex = start + index;
        
        try {
          // Extract required fields
          const {
            driver_name,
            driver_group,
            penalty_points,
            trips_count,
            duration,
            distance,
            start_date,
            end_date,
            client
          } = record;
          
          // Required field validation
          if (!driver_name || !driver_group || penalty_points === undefined || 
              trips_count === undefined || !start_date || !end_date || !client) {
            throw new Error("Missing required fields");
          }
          
          // Calculate score from penalty points and trips
          const score = calculateScore(penalty_points, trips_count);
          
          return {
            driver_name,
            driver_group,
            score,
            penalty_points,
            trips_count,
            duration_interval: duration,
            duration_text: typeof duration === 'string' ? duration : null,
            distance: typeof distance === 'number' ? distance : null,
            distance_text: typeof distance === 'string' ? distance : null,
            start_date,
            end_date,
            client
          };
        } catch (error) {
          errors.push({
            row: currentIndex + 1,
            message: error instanceof Error ? error.message : "Unknown error processing record",
            details: JSON.stringify(record)
          });
          return null;
        } finally {
          if (progressCallback) {
            progressCallback(
              `Procesando registros...`,
              currentIndex + 1,
              totalRecords
            );
          }
        }
      }).filter(Boolean);
      
      // Insert processed records into the database
      if (processedBatch.length > 0) {
        const { error } = await supabase
          .from('driver_behavior_scores')
          .insert(processedBatch);
        
        if (error) {
          console.error(`Error inserting batch ${i + 1}:`, error);
          errors.push({
            batch: i + 1,
            message: `Error inserting data: ${error.message}`,
            details: error.details
          });
        }
      }
      
      if (progressCallback) {
        progressCallback(
          `Batch ${i + 1}/${batches} completado`,
          Math.min((i + 1) * batchSize, totalRecords),
          totalRecords
        );
      }
    }
    
    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error("Error importing driver behavior data:", error);
    return {
      success: false,
      errors: [{ message: error instanceof Error ? error.message : "Unknown error" }]
    };
  }
}
