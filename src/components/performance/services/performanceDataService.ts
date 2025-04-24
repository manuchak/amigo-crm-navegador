
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

    const response = await supabase.functions.invoke('import-servicios-data', {
      body: formData
    });

    if (!response.data.success) {
      console.error("Error importing servicios data:", response.data);
      
      // If there are specific validation errors, display them
      if (response.data.errors && response.data.errors.length > 0) {
        const errorMessages = response.data.errors.map((err: any) => 
          `Fila ${err.row}: ${err.message}`
        ).join('\n');
        
        toast.error("Errores en el archivo Excel", {
          description: errorMessages.length > 100 
            ? `${errorMessages.substring(0, 100)}... (${response.data.errors.length} errores en total)`
            : errorMessages,
          duration: 5000
        });

        // Log full details to console for debugging
        console.table(response.data.errors);
      } else {
        toast.error("Error al importar datos", {
          description: response.data.message || "Revise el formato del archivo"
        });
      }
      
      return { success: false, errors: response.data.errors, message: response.data.message };
    }

    toast.success("Datos importados exitosamente", {
      description: response.data.message
    });
    
    return { success: true, message: response.data.message };
  } catch (error) {
    console.error("Error importing servicios data:", error);
    toast.error("Error al importar servicios", {
      description: error instanceof Error ? error.message : "Error desconocido"
    });
    
    return { success: false, error };
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
