
import { supabase } from "@/integrations/supabase/client";
import { DriverGroupDetails, DriverForGroup } from "../../types/driver-behavior.types";
import { toast } from "sonner";

// Fetch all driver groups for a specific client
export const fetchDriverGroups = async (clientName?: string): Promise<DriverGroupDetails[]> => {
  try {
    let query = supabase
      .from('driver_groups')
      .select('*');
      
    if (clientName && clientName !== 'all') {
      query = query.eq('client', clientName);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching driver groups:", error);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error("Exception when fetching driver groups:", error);
    return [];
  }
};

// Fetch drivers for a specific client (to add to groups)
export const fetchDriversByClient = async (clientName: string): Promise<DriverForGroup[]> => {
  if (!clientName || clientName === 'all') {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('driver_behavior_scores')
      .select('id, driver_name, client, score')
      .eq('client', clientName)
      .order('driver_name');
    
    if (error) {
      console.error("Error fetching drivers:", error);
      return [];
    }
    
    // Get unique drivers
    const driversMap = new Map<string, DriverForGroup>();
    
    data?.forEach(driver => {
      const driverId = `${driver.driver_name}-${driver.client}`.toLowerCase().replace(/\s+/g, '-');
      
      if (!driversMap.has(driverId)) {
        driversMap.set(driverId, {
          id: driverId,
          name: driver.driver_name,
          score: driver.score,
          client: driver.client
        });
      }
    });
    
    return Array.from(driversMap.values());
    
  } catch (error) {
    console.error("Exception when fetching drivers:", error);
    return [];
  }
};

// Create a new driver group
export const createDriverGroup = async (group: Partial<DriverGroupDetails>): Promise<DriverGroupDetails | null> => {
  try {
    // Create a unique ID for the group
    const groupId = `${group.name}-${group.client}`.toLowerCase().replace(/\s+/g, '-');
    
    const newGroup = {
      id: groupId,
      name: group.name,
      client: group.client,
      description: group.description || '',
      driver_ids: group.driver_ids || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('driver_groups')
      .insert(newGroup)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating driver group:", error);
      toast.error("Error al crear grupo", { description: error.message });
      return null;
    }
    
    toast.success("Grupo creado", { description: `El grupo "${group.name}" ha sido creado exitosamente` });
    return data;
    
  } catch (error) {
    console.error("Exception when creating driver group:", error);
    toast.error("Error inesperado al crear grupo");
    return null;
  }
};

// Update an existing driver group
export const updateDriverGroup = async (group: DriverGroupDetails): Promise<boolean> => {
  try {
    const updatedGroup = {
      ...group,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('driver_groups')
      .update(updatedGroup)
      .eq('id', group.id);
      
    if (error) {
      console.error("Error updating driver group:", error);
      toast.error("Error al actualizar grupo", { description: error.message });
      return false;
    }
    
    toast.success("Grupo actualizado", { description: `El grupo "${group.name}" ha sido actualizado exitosamente` });
    return true;
    
  } catch (error) {
    console.error("Exception when updating driver group:", error);
    toast.error("Error inesperado al actualizar grupo");
    return false;
  }
};

// Delete a driver group
export const deleteDriverGroup = async (groupId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('driver_groups')
      .delete()
      .eq('id', groupId);
      
    if (error) {
      console.error("Error deleting driver group:", error);
      toast.error("Error al eliminar grupo", { description: error.message });
      return false;
    }
    
    toast.success("Grupo eliminado", { description: "El grupo ha sido eliminado exitosamente" });
    return true;
    
  } catch (error) {
    console.error("Exception when deleting driver group:", error);
    toast.error("Error inesperado al eliminar grupo");
    return false;
  }
};
