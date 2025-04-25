
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ImportResponse, ImportProgress } from "../types";
import { supabase } from "@/integrations/supabase/client";

// Función para inicializar progress tracking
async function initializeProgressTracking(fileSize: number): Promise<string> {
  const progressId = uuidv4();
  
  try {
    const { error } = await supabase
      .from('import_progress')
      .upsert({
        id: progressId,
        status: 'validating',
        processed: 0,
        total: fileSize,
        message: 'Iniciando proceso de importación',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error initializing progress tracking:", error);
      toast.error("Error al iniciar seguimiento de progreso", {
        description: error.message
      });
    }
      
    return progressId;
  } catch (error) {
    console.error("Unexpected error initializing progress tracking:", error);
    return progressId;
  }
}

export async function callImportApi(
  formData: FormData,
  accessToken: string,
  abortController: AbortController
): Promise<ImportResponse> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      toast.error("Error de importación", {
        description: "No se proporcionó ningún archivo"
      });
      return { 
        success: false, 
        message: "No file provided in formData" 
      };
    }
    
    console.log(`Preparando subir archivo: ${file.name}, tamaño: ${file.size} bytes`);
    
    const progressId = await initializeProgressTracking(file.size);
    console.log(`ID de seguimiento de progreso creado: ${progressId}`);
    
    formData.append('progressId', progressId);
    
    const apiUrl = 'https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/import-servicios-data';
    console.log(`Enviando solicitud a: ${apiUrl}`);
    
    // Configurar un timeout más largo para el fetch debido al gran tamaño del archivo
    const timeoutPromise = new Promise<never>((_, reject) => {
      // 10 minutos para el fetch inicial (subida del archivo)
      setTimeout(() => reject(new Error("Tiempo de espera excedido")), 10 * 60 * 1000);
    });
    
    // Combinar la solicitud fetch con el promise de timeout
    const fetchPromise = fetch(
      apiUrl,
      {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w',
          'X-Progress-ID': progressId
        }
      }
    );
    
    // Esperar la primera respuesta o el timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    console.log(`Estado de respuesta: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = `Error del servidor: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("Detalles del error del servidor:", errorData);
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
        
        toast.error("Error en la importación", {
          description: errorMessage
        });
      } catch (parseError) {
        console.error("Error al analizar la respuesta de error:", parseError);
      }
      
      return { 
        success: false, 
        message: errorMessage,
        progressId
      };
    }

    const responseData = await response.json();
    console.log("Respuesta exitosa de la API:", responseData);
    
    toast.success("Importación iniciada", {
      description: "El archivo se está procesando"
    });
    
    return { ...responseData, progressId };
  } catch (error) {
    console.error("Error en la llamada de API:", error);
    
    // Manejar específicamente errores de timeout o aborts
    let errorMessage = error instanceof Error ? error.message : "Error desconocido";
    let errorDescription = errorMessage;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorDescription = "La operación fue cancelada";
      } else if (errorMessage.includes('tiempo') || errorMessage.includes('time')) {
        errorDescription = "La operación ha excedido el tiempo límite. El archivo puede ser demasiado grande.";
      }
    }
    
    toast.error("Error en la importación", {
      description: errorDescription
    });
    
    return { 
      success: false, 
      message: errorMessage
    };
  }
}

export async function checkImportProgress(progressId: string): Promise<ImportProgress> {
  try {
    console.log(`Verificando progreso para ID: ${progressId}`);
    
    const { data, error } = await supabase
      .from('import_progress')
      .select('*')
      .eq('id', progressId)
      .single();
      
    if (error) {
      console.error("Error verificando progreso de importación:", error);
      return {
        id: progressId,
        status: 'error',
        processed: 0,
        total: 0,
        message: "Error al verificar el progreso de importación"
      };
    }
    
    if (!data) {
      console.warn("No se encontraron datos de progreso para ID:", progressId);
      return {
        id: progressId,
        status: 'error',
        processed: 0,
        total: 0,
        message: "No se encontró información de progreso"
      };
    }
    
    console.log("Datos de progreso recuperados:", data);
    return data as ImportProgress;
  } catch (error) {
    console.error("Excepción al verificar progreso de importación:", error);
    return {
      id: progressId,
      status: 'error',
      processed: 0,
      total: 0,
      message: "Error al consultar el estado de la importación"
    };
  }
}
