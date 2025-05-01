
import { supabase } from "@/integrations/supabase/client";
import { NewProductivityParameter, ProductivityParameter, ProductivityAnalysis } from "../../types/productivity.types";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { DriverBehaviorFilters } from "../../types/driver-behavior.types";

// Fetch productivity parameters with optional client filter
export const fetchProductivityParameters = async (clientName?: string): Promise<ProductivityParameter[]> => {
  try {
    let query = supabase
      .from('driver_productivity_parameters')
      .select('*');
      
    if (clientName && clientName !== 'all') {
      query = query.eq('client', clientName);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching productivity parameters:", error);
      toast.error("Error al cargar parámetros", { 
        description: error.message 
      });
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error("Exception when fetching productivity parameters:", error);
    toast.error("Error inesperado al cargar parámetros");
    return [];
  }
};

// Save productivity parameter
export const saveProductivityParameter = async (parameter: NewProductivityParameter): Promise<ProductivityParameter | null> => {
  try {
    console.log("Saving productivity parameter:", parameter);
    
    // Check if a parameter exists for this client/group combination
    let query = supabase
      .from('driver_productivity_parameters')
      .select('id')
      .eq('client', parameter.client);
      
    if (parameter.driver_group) {
      query = query.eq('driver_group', parameter.driver_group);
    } else {
      query = query.is('driver_group', null);
    }
    
    const { data: existingParams, error: findError } = await query;
    
    if (findError) {
      throw findError;
    }
    
    let result;
    
    if (existingParams && existingParams.length > 0) {
      // Update existing parameter
      const { data, error } = await supabase
        .from('driver_productivity_parameters')
        .update({
          expected_daily_distance: parameter.expected_daily_distance,
          expected_daily_time_minutes: parameter.expected_daily_time_minutes,
          fuel_cost_per_liter: parameter.fuel_cost_per_liter,
          expected_fuel_efficiency: parameter.expected_fuel_efficiency,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingParams[0].id)
        .select('*')
        .single();
        
      if (error) throw error;
      result = data;
      console.log("Updated existing parameter:", result);
    } else {
      // Create new parameter
      const { data, error } = await supabase
        .from('driver_productivity_parameters')
        .insert({
          ...parameter,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
        
      if (error) throw error;
      result = data;
      console.log("Created new parameter:", result);
    }
    
    return result;
    
  } catch (error: any) {
    console.error("Error saving productivity parameter:", error);
    
    // Check for duplicate value error
    if (error.code === '23505') {
      toast.error("Error al guardar parámetros", { 
        description: "Ya existe un parámetro para este cliente y grupo" 
      });
    } else {
      toast.error("Error al guardar parámetros", { 
        description: error.message || "Error inesperado" 
      });
    }
    
    return null;
  }
};

// Delete productivity parameter
export const deleteProductivityParameter = async (parameterId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('driver_productivity_parameters')
      .delete()
      .eq('id', parameterId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error deleting productivity parameter:", error);
    toast.error("Error al eliminar el parámetro", {
      description: error.message || "Error inesperado"
    });
    return false;
  }
};

// Update all fuel prices based on national average
export const updateAllFuelPrices = async (): Promise<{ recordsUpdated: number; nationalPrice: number }> => {
  try {
    // Mock current national price - in a real app you'd fetch this from an API
    const nationalAveragePrice = 24.99;
    
    // Update all parameters with the new fuel price
    const { data, error } = await supabase
      .from('driver_productivity_parameters')
      .update({ 
        fuel_cost_per_liter: nationalAveragePrice,
        updated_at: new Date().toISOString()
      })
      .neq('id', 0) // Update all records
      .select('id');
    
    if (error) throw error;
    
    return { 
      recordsUpdated: data?.length || 0,
      nationalPrice: nationalAveragePrice
    };
  } catch (error: any) {
    console.error("Error updating fuel prices:", error);
    toast.error("Error al actualizar precios de combustible", {
      description: error.message || "Error inesperado"
    });
    throw error;
  }
};

// Fetch current fuel prices (mock example for now)
export const fetchCurrentFuelPrices = async (): Promise<{ regular: number, premium: number }> => {
  try {
    // In a real app, this would make an API call to get current prices
    // For now we'll just return mock data
    return { regular: 24.99, premium: 26.99 };
  } catch (error) {
    console.error("Error fetching fuel prices:", error);
    throw error;
  }
};

// Fetch productivity analysis data
export const fetchProductivityAnalysis = async (
  dateRange: DateRange,
  filters?: DriverBehaviorFilters
): Promise<ProductivityAnalysis[]> => {
  try {
    console.log("Fetching productivity analysis with:", { dateRange, filters });
    
    if (!dateRange.from || !dateRange.to) {
      return [];
    }
    
    // Format dates for query
    const startDate = dateRange.from.toISOString();
    const endDate = dateRange.to.toISOString();
    
    // For development/testing - if no data in real table, use driver_behavior_scores
    // and create mock productivity data based on that
    let query = supabase
      .from('driver_productivity_analysis')
      .select('*')
      .gte('start_date', startDate)
      .lte('end_date', endDate);
    
    // Apply filters if provided
    if (filters) {
      if (filters.selectedClient && filters.selectedClient !== 'all') {
        query = query.eq('client', filters.selectedClient);
      }
      
      if (filters.selectedGroup && filters.selectedGroup !== 'all') {
        query = query.eq('driver_group', filters.selectedGroup);
      }
    }
    
    let { data, error } = await query;
    
    if (error) {
      console.error("Error fetching productivity analysis:", error);
      toast.error("Error al cargar análisis de productividad", { 
        description: error.message 
      });
      return [];
    }

    // If no data found, create mock data from driver_behavior_scores
    if (!data || data.length === 0) {
      console.log("No productivity data found, creating mock data from driver scores");
      
      // Fetch data from driver_behavior_scores instead
      let scoreQuery = supabase
        .from('driver_behavior_scores')
        .select('*')
        .gte('start_date', startDate)
        .lte('end_date', endDate);
      
      // Apply same filters
      if (filters) {
        if (filters.selectedClient && filters.selectedClient !== 'all') {
          scoreQuery = scoreQuery.eq('client', filters.selectedClient);
        }
        
        if (filters.selectedGroup && filters.selectedGroup !== 'all') {
          scoreQuery = scoreQuery.eq('driver_group', filters.selectedGroup);
        }
      }
      
      const { data: scoreData, error: scoreError } = await scoreQuery;
      
      if (scoreError) {
        console.error("Error fetching driver scores for mock data:", scoreError);
        return [];
      }
      
      if (scoreData && scoreData.length > 0) {
        // Convert driver behavior scores to productivity analysis format with mock data
        data = scoreData.map(score => {
          // Create realistic productivity parameters
          const expectedDailyDistance = Math.floor(Math.random() * 200) + 100; // 100-300 km
          const expectedDailyTimeMinutes = Math.floor(Math.random() * 240) + 240; // 4-8 hours in minutes
          const fuelCostPerLiter = 24.99; // Fixed cost for now
          const expectedFuelEfficiency = Math.floor(Math.random() * 5) + 8; // 8-13 km/L

          // Calculate actual daily distance
          const daysCount = Math.max(1, Math.round((new Date(score.end_date).getTime() - new Date(score.start_date).getTime()) / (1000 * 60 * 60 * 24)));
          const actualDailyDistance = score.distance ? score.distance / daysCount : 0;
          
          // Calculate fuel usage
          const estimatedFuelUsage = score.distance ? score.distance / expectedFuelEfficiency : 0;
          const estimatedFuelCost = estimatedFuelUsage * fuelCostPerLiter;
          
          // Calculate productivity score (70-100 range, inverse of penalty points)
          const baseScore = 100 - Math.min(30, score.penalty_points / 10);
          
          return {
            id: score.id,
            client: score.client,
            driver_name: score.driver_name,
            driver_group: score.driver_group,
            start_date: score.start_date,
            end_date: score.end_date,
            distance: score.distance || 0,
            duration_interval: score.duration_interval || null,
            trips_count: score.trips_count || 0,
            days_count: daysCount,
            productivity_score: baseScore,
            expected_daily_distance: expectedDailyDistance,
            expected_daily_time_minutes: expectedDailyTimeMinutes,
            actual_daily_distance: actualDailyDistance,
            fuel_cost_per_liter: fuelCostPerLiter,
            expected_fuel_efficiency: expectedFuelEfficiency,
            estimated_fuel_usage_liters: estimatedFuelUsage,
            estimated_fuel_cost: estimatedFuelCost
          };
        });
        
        console.log("Created mock productivity data from driver scores:", data.length, "records");
      }
    }
    
    console.log("Productivity analysis data fetched:", data?.length || 0, "records");
    return data || [];
    
  } catch (error) {
    console.error("Exception when fetching productivity analysis:", error);
    toast.error("Error inesperado al cargar análisis");
    return [];
  }
};

// Calculate productivity summary metrics from analysis data
export const calculateProductivitySummary = (
  analysisData: ProductivityAnalysis[]
) => {
  if (!analysisData || analysisData.length === 0) {
    return null;
  }
  
  const totalDrivers = analysisData.length;
  
  // Calculate high and low performers based on productivity score
  const highPerformers = analysisData.filter(driver => 
    driver.productivity_score !== null && driver.productivity_score >= 90
  ).length;
  
  const lowPerformers = analysisData.filter(driver => 
    driver.productivity_score !== null && driver.productivity_score < 70
  ).length;
  
  // Calculate average score
  const validScores = analysisData
    .filter(driver => driver.productivity_score !== null)
    .map(driver => driver.productivity_score as number);
  
  const averageProductivityScore = validScores.length > 0 
    ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    : 0;
  
  // Calculate total distance covered
  const totalDistanceCovered = analysisData.reduce(
    (sum, driver) => sum + (driver.distance || 0), 
    0
  );
  
  // Calculate total fuel cost
  const totalFuelCost = analysisData.reduce(
    (sum, driver) => sum + (driver.estimated_fuel_cost || 0), 
    0
  );
  
  // Format total time spent
  const totalMinutes = analysisData.reduce((sum, driver) => {
    if (!driver.duration_interval) return sum;
    
    // Extract hours and minutes from interval string like "02:30:00"
    const matches = driver.duration_interval.match(/(\d+):(\d+):(\d+)/);
    if (matches) {
      const hours = parseInt(matches[1]);
      const minutes = parseInt(matches[2]);
      return sum + (hours * 60 + minutes);
    }
    return sum;
  }, 0);
  
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalTimeSpent = `${totalHours}h ${remainingMinutes}m`;
  
  return {
    totalDrivers,
    highPerformers,
    lowPerformers,
    averageProductivityScore,
    totalDistanceCovered,
    totalFuelCost,
    totalTimeSpent
  };
};

// Fetch list of clients for dropdowns
export const fetchClientList = async (): Promise<string[]> => {
  try {
    // First try to get clients from driver_behavior_scores table
    let { data: clientsData, error } = await supabase
      .from('driver_behavior_scores')
      .select('client')
      .not('client', 'is', null)
      .order('client');
    
    if (error) {
      console.error("Error fetching clients from driver_behavior_scores:", error);
      return [];
    }
    
    let clients = clientsData.map(c => c.client);
    
    // Also get clients from driver_productivity_parameters
    const { data: paramClients, error: paramError } = await supabase
      .from('driver_productivity_parameters')
      .select('client')
      .not('client', 'is', null)
      .order('client');
    
    if (!paramError && paramClients) {
      // Combine both client lists
      clients = [...clients, ...paramClients.map(c => c.client)];
    }
    
    // Get unique clients
    const uniqueClients = Array.from(new Set(clients)).filter(Boolean);
    console.log("Fetched client list:", uniqueClients);
    
    return uniqueClients;
    
  } catch (error) {
    console.error("Exception when fetching client list:", error);
    return [];
  }
};

// Fetch driver groups with optional client filter
export const fetchDriverGroups = async (clientName?: string): Promise<string[]> => {
  try {
    const groups = await import('../../services/driverBehavior/driverGroupsService')
      .then(module => module.fetchDriverGroups(clientName));
      
    const groupNames = groups.map(group => typeof group === 'string' ? group : group.name);
    return groupNames;
    
  } catch (error) {
    console.error("Error fetching driver groups:", error);
    return [];
  }
};
