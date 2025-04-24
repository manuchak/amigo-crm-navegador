import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function fetchExcelData() {
  try {
    const { data, error } = await supabase
      .from('custodio_excel_data')
      .select('*')
      .order('fecha_cita', { ascending: false });

    if (error) {
      console.error("Error fetching custodio data:", error);
      toast.error("Error loading performance data");
      throw error;
    }

    return data.map(row => ({
      FechaCita: row.fecha_cita,
      NombreCustodio: row.nombre_custodio,
      MesesActivo: row.meses_activo,
      TrabajosCompletados: row.trabajos_completados,
      CalificacionPromedio: row.calificacion_promedio,
      Confiabilidad: row.confiabilidad,
      TiempoRespuesta: row.tiempo_respuesta,
      Ingresos: row.ingresos,
      ValorVidaCliente: row.valor_vida_cliente,
      Estado: row.estado
    }));
  } catch (error) {
    console.error("Error fetching Excel data:", error);
    toast.error("Error loading performance data");
    throw error;
  }
}

export async function importServiciosData(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await supabase.functions.invoke('import-servicios-data', {
      body: formData
    });

    if (error) {
      console.error("Error importing servicios data:", error);
      toast.error("Error importing servicios data");
      throw error;
    }

    toast.success("Servicios data imported successfully");
    return data;
  } catch (error) {
    console.error("Error importing servicios data:", error);
    toast.error("Error importing servicios data");
    throw error;
  }
}

export async function fetchServiciosData() {
  try {
    const { data, error } = await supabase
      .from('servicios_custodia')
      .select('*')
      .order('fecha_hora_cita', { ascending: false });

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
