
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

// Progress tracking type for importServiciosData
type ProgressCallback = (status: string, processed: number, total: number) => void;

export async function importServiciosData(
  file: File, 
  onProgress?: ProgressCallback
) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    toast.info("Importando datos", { 
      description: "Por favor espere mientras procesamos el archivo...",
      duration: 0,
      id: "import-toast"
    });

    if (onProgress) {
      onProgress("Preparando importación", 0, 0);
    }

    // Get current session using more reliable async/await pattern
    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      toast.error("Error de autenticación", {
        description: "Error al obtener la sesión: " + sessionError.message
      });
      return { success: false, message: "Error al obtener la sesión" };
    }
    
    if (!data.session) {
      console.error("No active session");
      toast.error("Error de autenticación", {
        description: "No hay sesión activa. Por favor inicie sesión nuevamente."
      });
      return { success: false, message: "No hay sesión activa" };
    }
    
    // Use the access_token from the active session with proper error handling
    const accessToken = data.session.access_token;
    
    if (!accessToken) {
      console.error("No access token in session");
      toast.error("Error de autenticación", {
        description: "No se pudo obtener el token de acceso. Por favor inicie sesión nuevamente."
      });
      return { success: false, message: "No se pudo obtener el token de acceso" };
    }
    
    if (onProgress) {
      onProgress("Subiendo archivo al servidor", 0, 0);
    }
    
    // Setup timeout to avoid function timeout at 10s
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 25000);
    
    try {
      // Convert to regular fetch for better error handling
      const response = await fetch(
        `https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/import-servicios-data`,
        {
          method: 'POST',
          body: formData,
          signal: abortController.signal,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            // Use the ANON key directly instead of process.env
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = `Error del servidor: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        
        console.error("Error importing servicios data:", errorMessage);
        toast.error("Error al importar datos", {
          description: errorMessage,
          id: "import-toast"
        });
        
        return { 
          success: false, 
          message: errorMessage 
        };
      }

      // Parse successful response
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error("Error parsing successful response:", parseError);
        toast.error("Error al procesar la respuesta del servidor", {
          description: "La respuesta no tiene el formato esperado",
          id: "import-toast"
        });
        return { 
          success: false, 
          message: "Error al procesar la respuesta del servidor" 
        };
      }
      
      if (!responseData || responseData.success === undefined) {
        console.error("Invalid response format:", responseData);
        toast.error("Respuesta del servidor inválida", {
          description: "La respuesta no tiene el formato esperado",
          id: "import-toast"
        });
        return {
          success: false,
          message: "Respuesta del servidor inválida"
        };
      }
      
      if (!responseData.success) {
        console.error("Error importing servicios data:", responseData);
        
        if (responseData.errors && responseData.errors.length > 0) {
          const errorMessages = responseData.errors.map((err) => 
            `Fila ${err.row}: ${err.message}`
          ).join('\n');
          
          toast.error("Errores en el archivo Excel", {
            description: errorMessages.length > 100 
              ? `${errorMessages.substring(0, 100)}... (${responseData.errors.length} errores en total)`
              : errorMessages,
            duration: 5000,
            id: "import-toast"
          });

          console.table(responseData.errors);
        } else {
          toast.error("Error al importar datos", {
            description: responseData.message || "Revise el formato del archivo",
            id: "import-toast"
          });
        }
        
        return { success: false, errors: responseData.errors, message: responseData.message };
      }

      toast.success("Datos importados exitosamente", {
        description: responseData.message,
        id: "import-toast"
      });
      
      return { success: true, message: responseData.message };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error("Request timed out");
        toast.error("La importación está tomando demasiado tiempo", {
          description: "El archivo es muy grande y puede causar problemas de recursos. Intente con un archivo más pequeño.",
          id: "import-toast"
        });
        return { 
          success: false, 
          message: "La operación excedió el tiempo límite" 
        };
      }
      throw fetchError; // Re-throw for the outer catch
    }
  } catch (error) {
    console.error("Error importing servicios data:", error);
    toast.error("Error al importar servicios", {
      description: error instanceof Error ? error.message : "Error de comunicación con el servidor",
      id: "import-toast"
    });
    
    return { success: false, error };
  }
}

export async function fetchServiciosData() {
  try {
    const { data, error } = await supabase
      .from('servicios_custodia')
      .select('*')
      .order('fecha_hora_cita', { ascending: false })
      .limit(500); // Add limit to avoid performance issues

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
