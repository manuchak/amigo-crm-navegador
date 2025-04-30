
import { supabase } from "@/integrations/supabase/client";
import { DriverGroupDetails, DriverForGroup } from "../../types/driver-behavior.types";
import { toast } from "sonner";

// Fetch all driver groups for a specific client
export const fetchDriverGroups = async (clientName?: string): Promise<DriverGroupDetails[]> => {
  try {
    console.log("Fetching driver groups for client:", clientName || "all");
    
    let query = supabase
      .from('driver_groups')
      .select('*');
      
    if (clientName && clientName !== 'all') {
      query = query.eq('client', clientName);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching driver groups:", error);
      toast.error("Error al cargar grupos", { 
        description: error.message 
      });
      return [];
    }
    
    console.log(`Found ${data?.length || 0} driver groups`);
    return data || [];
    
  } catch (error) {
    console.error("Exception when fetching driver groups:", error);
    toast.error("Error inesperado al cargar grupos");
    return [];
  }
};

// Fetch drivers for a specific client (to add to groups)
export const fetchDriversByClient = async (clientName: string): Promise<DriverForGroup[]> => {
  console.log("Fetching drivers for client:", clientName);
  
  if (!clientName || clientName === 'all') {
    console.warn("No client name provided for fetchDriversByClient");
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
      toast.error("Error al cargar conductores", {
        description: error.message
      });
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`No drivers found for client: ${clientName}`);
      return [];
    }
    
    console.log(`Found ${data.length} drivers for client ${clientName}`);
    
    // Get unique drivers
    const driversMap = new Map<string, DriverForGroup>();
    
    data.forEach(driver => {
      if (!driver.driver_name) {
        console.warn("Found driver entry without name", driver);
        return;
      }
      
      // Create a unique ID based on name and client
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
    
    const drivers = Array.from(driversMap.values());
    console.log("Processed unique drivers:", drivers.length);
    return drivers;
    
  } catch (error) {
    console.error("Exception when fetching drivers:", error);
    toast.error("Error inesperado al cargar conductores");
    return [];
  }
};

// Create a new driver group
export const createDriverGroup = async (group: Partial<DriverGroupDetails>): Promise<DriverGroupDetails | null> => {
  try {
    console.log("Creating driver group:", group);
    
    // Validate required fields
    if (!group.name || !group.client) {
      toast.error("Datos incompletos", {
        description: "El nombre y cliente son requeridos para crear un grupo"
      });
      return null;
    }
    
    // Create a unique ID for the group
    const groupId = `${group.name}-${group.client}`.toLowerCase().replace(/\s+/g, '-');
    
    // Ensure driver_ids is defined and is an array
    const driver_ids = Array.isArray(group.driver_ids) ? group.driver_ids : [];
    
    const newGroup = {
      id: groupId,
      name: group.name,
      client: group.client,
      description: group.description || '',
      driver_ids: driver_ids,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log("Sending new group to database:", newGroup);
    
    const { data, error } = await supabase
      .from('driver_groups')
      .insert(newGroup)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating driver group:", error);
      
      // Check if it's a duplicate key error
      if (error.code === '23505') {
        toast.error("Error al crear grupo", { description: "Ya existe un grupo con este nombre para este cliente" });
      } else {
        toast.error("Error al crear grupo", { description: error.message });
      }
      
      return null;
    }
    
    console.log("Group created successfully:", data);
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
    console.log("Updating driver group:", group);
    
    // Ensure driver_ids is an array
    const driver_ids = Array.isArray(group.driver_ids) ? group.driver_ids : [];
    
    const updatedGroup = {
      ...group,
      driver_ids: driver_ids,
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
    
    console.log("Group updated successfully");
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
    console.log("Deleting driver group:", groupId);
    
    const { error } = await supabase
      .from('driver_groups')
      .delete()
      .eq('id', groupId);
      
    if (error) {
      console.error("Error deleting driver group:", error);
      toast.error("Error al eliminar grupo", { description: error.message });
      return false;
    }
    
    console.log("Group deleted successfully");
    toast.success("Grupo eliminado", { description: "El grupo ha sido eliminado exitosamente" });
    return true;
    
  } catch (error) {
    console.error("Exception when deleting driver group:", error);
    toast.error("Error inesperado al eliminar grupo");
    return false;
  }
};
