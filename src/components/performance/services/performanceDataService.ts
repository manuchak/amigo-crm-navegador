
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

    toast.info("Importando datos", { 
      description: "Por favor espere mientras procesamos el archivo..." 
    });

    // Convert to regular fetch for better error handling
    const response = await fetch(
      `https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/import-servicios-data`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`,
          'apikey': supabase.supabaseKey
        }
      }
    );
    
    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `Error del servidor: ${response.status}`;
      
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // JSON parsing failed, use default error message
      }
      
      console.error("Error importing servicios data:", errorMessage);
      toast.error("Error al importar datos", {
        description: errorMessage
      });
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }

    // Parse successful response
    const responseData = await response.json();
    
    if (!responseData.success) {
      console.error("Error importing servicios data:", responseData);
      
      // If there are specific validation errors, display them
      if (responseData.errors && responseData.errors.length > 0) {
        const errorMessages = responseData.errors.map((err) => 
          `Fila ${err.row}: ${err.message}`
        ).join('\n');
        
        toast.error("Errores en el archivo Excel", {
          description: errorMessages.length > 100 
            ? `${errorMessages.substring(0, 100)}... (${responseData.errors.length} errores en total)`
            : errorMessages,
          duration: 5000
        });

        // Log full details to console for debugging
        console.table(responseData.errors);
      } else {
        toast.error("Error al importar datos", {
          description: responseData.message || "Revise el formato del archivo"
        });
      }
      
      return { success: false, errors: responseData.errors, message: responseData.message };
    }

    toast.success("Datos importados exitosamente", {
      description: responseData.message
    });
    
    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Error importing servicios data:", error);
    toast.error("Error al importar servicios", {
      description: error instanceof Error ? error.message : "Error de comunicación con el servidor"
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
