import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ImportResponse, ImportProgress } from "../types";
import { supabase } from "@/integrations/supabase/client";

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

export async function testEdgeFunctionConnection(): Promise<boolean> {
  try {
    console.log("Verificando conectividad con la función Edge...");
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("Error de sesión:", sessionError);
      return false;
    }
    
    const accessToken = sessionData.session.access_token;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const apiUrl = 'https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/import-servicios-data';
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w',
        'X-Test-Connection': 'true'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log("Conexión exitosa con la función Edge");
      return true;
    }
    
    console.error("Error conectando con la función Edge:", response.status);
    return false;
  } catch (error) {
    console.error("Error verificando conectividad:", error);
    return false;
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
    
    const isConnected = await testEdgeFunctionConnection();
    if (!isConnected) {
      console.warn("No se pudo establecer conexión con la función Edge. Intentando de todos modos...");
    }
    
    const progressId = await initializeProgressTracking(file.size);
    console.log(`ID de seguimiento de progreso creado: ${progressId}`);
    
    formData.append('progressId', progressId);
    
    const isCSV = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/csv';
    if (isCSV && !formData.has('format')) {
      formData.append('format', 'csv');
    }
    
    const apiUrl = 'https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/import-servicios-data';
    console.log(`Enviando solicitud a: ${apiUrl}`);
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Tiempo de espera excedido")), 5 * 60 * 1000);
        });
        
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
          
          if (response.status >= 500) {
            console.log(`Reintentando (${retryCount + 1}/${maxRetries})...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            continue;
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
      } catch (fetchError) {
        console.error(`Error en intento ${retryCount + 1}:`, fetchError);
        
        if (retryCount >= maxRetries) {
          throw fetchError;
        }
        
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
    
    throw new Error("Máximos reintentos alcanzados");
  } catch (error) {
    console.error("Error en la llamada de API:", error);
    
    let errorMessage = error instanceof Error ? error.message : "Error desconocido";
    let errorDescription = errorMessage;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorDescription = "La operación fue cancelada";
      } else if (errorMessage.includes('tiempo') || errorMessage.includes('time')) {
        errorDescription = "La operación ha excedido el tiempo límite. El archivo puede ser demasiado grande.";
      } else if (errorMessage.includes('fetch') || error.name === 'TypeError') {
        errorDescription = "Error de conexión con la API. Verifique su conexión a internet o contacte al administrador.";
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
