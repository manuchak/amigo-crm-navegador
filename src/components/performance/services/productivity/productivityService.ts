import { supabase } from "@/integrations/supabase/client";
import { 
  ProductivityParameter, 
  NewProductivityParameter, 
  ProductivityAnalysis, 
  ProductivitySummary,
  FuelPrices
} from "../../types/productivity.types";
import { DateRange } from "react-day-picker";

// Fetch productivity parameters for a specific client and driver group
export const fetchProductivityParameters = async (
  client?: string,
  driver_group?: string
): Promise<ProductivityParameter[]> => {
  let query = supabase
    .from('driver_productivity_parameters')
    .select('*')
    .order('client', { ascending: true });
  
  if (client) {
    query = query.eq('client', client);
  }
  
  if (driver_group) {
    query = query.eq('driver_group', driver_group);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching productivity parameters:", error);
    throw error;
  }
  
  return data || [];
};

// Save productivity parameter
export const saveProductivityParameter = async (
  parameter: NewProductivityParameter
): Promise<ProductivityParameter> => {
  try {
    const { data, error } = await supabase
      .rpc('update_productivity_parameters', {
        p_id: parameter.id || null,
        p_client: parameter.client,
        p_driver_group: parameter.driver_group || null,
        p_expected_daily_distance: parameter.expected_daily_distance,
        p_expected_daily_time_minutes: parameter.expected_daily_time_minutes,
        p_fuel_cost_per_liter: parameter.fuel_cost_per_liter,
        p_expected_fuel_efficiency: parameter.expected_fuel_efficiency,
        p_user_id: (await supabase.auth.getUser()).data.user?.id
      });
    
    if (error) {
      console.error("Error saving productivity parameter:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned from save operation");
    }
    
    // Fetch the saved parameter to return the complete record
    const { data: savedParameter, error: fetchError } = await supabase
      .from('driver_productivity_parameters')
      .select('*')
      .eq('id', data[0].id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching saved parameter:", fetchError);
      throw fetchError;
    }
    
    return savedParameter;
  } catch (error) {
    console.error("Exception in saveProductivityParameter:", error);
    throw error;
  }
};

// Delete a productivity parameter
export const deleteProductivityParameter = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('driver_productivity_parameters')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting productivity parameter:", error);
    throw error;
  }
};

// Fetch current fuel prices from web scraper
export const fetchCurrentFuelPrices = async (): Promise<FuelPrices> => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-fuel-prices');
    
    if (error) {
      console.error("Error fetching fuel prices:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error invoking fetch-fuel-prices function:", error);
    throw error;
  }
};

// Update all fuel prices to national average
export const updateAllFuelPrices = async (): Promise<{ nationalPrice: number, recordsUpdated: number }> => {
  try {
    // First get the current price from our scraper
    const fuelPrices = await fetchCurrentFuelPrices();
    const regularPrice = fuelPrices.regular;
    
    if (!regularPrice) {
      throw new Error("Could not retrieve regular fuel price");
    }
    
    // Now update all parameters with the new price
    const { data, error } = await supabase
      .from('driver_productivity_parameters')
      .update({ fuel_cost_per_liter: regularPrice, updated_at: new Date().toISOString() })
      .neq('id', 0) // Update all records
      .select('id');
    
    if (error) {
      console.error("Error updating fuel prices:", error);
      throw error;
    }
    
    return {
      nationalPrice: regularPrice,
      recordsUpdated: data?.length || 0
    };
  } catch (error) {
    console.error("Error in updateAllFuelPrices:", error);
    throw error;
  }
};

// Fetch productivity analysis data
// Updated to remove client filtering
export const fetchProductivityAnalysis = async (
  dateRange: DateRange
): Promise<ProductivityAnalysis[]> => {
  // Validate that both from and to dates exist
  if (!dateRange.from || !dateRange.to) {
    console.warn("Invalid date range provided to fetchProductivityAnalysis");
    return [];
  }
  
  let query = supabase
    .from('driver_productivity_analysis')
    .select('*')
    .gte('start_date', dateRange.from.toISOString())
    .lte('end_date', dateRange.to.toISOString());
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching productivity analysis:", error);
    throw error;
  }
  
  return data || [];
};

// Calculate productivity summary
export const calculateProductivitySummary = (data: ProductivityAnalysis[]): ProductivitySummary => {
  if (!data || data.length === 0) {
    return {
      totalDrivers: 0,
      highPerformers: 0,
      averagePerformers: 0,
      lowPerformers: 0,
      averageProductivityScore: 0,
      totalDistanceCovered: 0,
      totalFuelCost: 0,
      totalTimeSpent: '0h 0m'
    };
  }
  
  const driversWithScore = data.filter(d => d.productivity_score !== null);
  const highPerformers = driversWithScore.filter(d => (d.productivity_score || 0) >= 100).length;
  const averagePerformers = driversWithScore.filter(d => (d.productivity_score || 0) >= 80 && (d.productivity_score || 0) < 100).length;
  const lowPerformers = driversWithScore.filter(d => (d.productivity_score || 0) < 80).length;
  
  const totalDistanceCovered = data.reduce((sum, d) => sum + (d.distance || 0), 0);
  const totalFuelCost = data.reduce((sum, d) => sum + (d.estimated_fuel_cost || 0), 0);
  
  // Convert total minutes to hours and minutes format
  const totalMinutes = data.reduce((sum, d) => {
    if (d.duration_interval) {
      const matches = d.duration_interval.match(/(\d+):(\d+):(\d+)/);
      if (matches) {
        const hours = parseInt(matches[1]);
        const minutes = parseInt(matches[2]);
        return sum + (hours * 60) + minutes;
      }
    }
    return sum;
  }, 0);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return {
    totalDrivers: data.length,
    highPerformers,
    averagePerformers,
    lowPerformers,
    averageProductivityScore: driversWithScore.length > 0 
      ? driversWithScore.reduce((sum, d) => sum + (d.productivity_score || 0), 0) / driversWithScore.length 
      : 0,
    totalDistanceCovered,
    totalFuelCost,
    totalTimeSpent: `${hours}h ${minutes}m`
  };
};
