
import { supabase } from "@/integrations/supabase/client";
import { NewProductivityParameter, ProductivityParameter } from "../../types/productivity.types";
import { toast } from "sonner";

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
