
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
  
  try {
    let query = supabase
      .from('driver_behavior_scores')
      .select('*');
      
    // Aplicar filtro de rango de fechas si se proporciona
    // Modificado para asegurar que los registros estén dentro del rango de fechas seleccionado
    // Un registro está dentro del rango si:
    // - Su fecha de inicio está dentro del rango de fechas
    // - O su fecha de fin está dentro del rango de fechas
    // - O el rango de fechas está completamente dentro del período del registro
    if (dateRange.from) {
      // La fecha de inicio o final del registro está después de la fecha "from" del filtro
      query = query.or(`start_date.gte.${dateRange.from.toISOString()},end_date.gte.${dateRange.from.toISOString()}`);
    }
    
    if (dateRange.to) {
      // La fecha de inicio o final del registro está antes de la fecha "to" del filtro
      query = query.or(`start_date.lte.${dateRange.to.toISOString()},end_date.lte.${dateRange.to.toISOString()}`);
    }
    
    // Aplicar filtro de cliente si se proporciona
    if (filters?.selectedClients && filters.selectedClients.length > 0) {
      console.log("Applying client filter:", filters.selectedClients);
      query = query.in('client', filters.selectedClients);
    }
    
    // Aplicar filtro de nombre de conductor si se proporciona
    if (filters?.driverName && filters.driverName.trim() !== '') {
      console.log("Applying driver name filter:", filters.driverName);
      query = query.ilike('driver_name', `%${filters.driverName}%`);
    }
    
    // Ejecutar la consulta
    const { data: driverScores, error } = await query;
    
    if (error) {
      console.error("Error fetching driver behavior data:", error);
      throw error;
    }
    
    if (!driverScores || driverScores.length === 0) {
      console.log("No driver behavior data found with applied filters");
      // Devolver estructura de datos vacía
      return createEmptyDriverBehaviorData();
    }
    
    console.log(`Found ${driverScores.length} driver behavior records`);
    console.log("First record sample:", driverScores[0]);
    
    // Procesar los datos para crear la estructura DriverBehaviorData
    return processDriverBehaviorData(driverScores);
    
  } catch (err) {
    console.error("Exception when fetching driver data:", err);
    // En caso de cualquier excepción, devolver datos vacíos
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
      // Extraer nombres únicos de clientes
      const uniqueClients = Array.from(new Set(data.map(item => item.client))).filter(Boolean) as string[];
      console.log("Found client list from database:", uniqueClients);
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
