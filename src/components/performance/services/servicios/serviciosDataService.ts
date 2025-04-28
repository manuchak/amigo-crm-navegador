
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function fetchServiciosData() {
  try {
    const { data, error } = await supabase
      .from('servicios_custodia')
      .select('*')
      .order('fecha_hora_cita', { ascending: false })
      .limit(500);

    if (error) {
      console.error("Error fetching servicios data:", error);
      toast.error("Error loading servicios data");
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching servicios data:", error);
    toast.error("Error loading servicios data");
    throw error;
  }
}

// Helper function to parse interval to minutes
export function parseIntervalToMinutes(interval: string | null): number {
  if (!interval) return 0;
  
  let minutes = 0;
  
  // Extract hours
  const hoursMatch = interval.match(/(\d+)\s*hours?/);
  if (hoursMatch && hoursMatch[1]) {
    minutes += parseInt(hoursMatch[1], 10) * 60;
  }
  
  // Extract minutes
  const minsMatch = interval.match(/(\d+)\s*minutes?/);
  if (minsMatch && minsMatch[1]) {
    minutes += parseInt(minsMatch[1], 10);
  }
  
  return minutes;
}

// Helper function to format minutes to hours and minutes
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}
