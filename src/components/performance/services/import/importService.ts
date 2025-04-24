
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProgressCallback, ImportResponse } from "./types";
import { callImportApi, checkImportProgress } from "./api/importApi";
import { handleImportError } from "./utils/errorHandler";
import { handleImportResponse } from "./utils/responseHandler";

export async function importServiciosData(
  file: File, 
  onProgress?: ProgressCallback
): Promise<ImportResponse> {
  try {
    // Validate file size early
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Archivo muy grande", {
        description: "El archivo excede el tamaño máximo permitido de 15 MB. Por favor, utilice un archivo más pequeño."
      });
      return { success: false, message: "El archivo excede el tamaño máximo permitido" };
    }
    
    const toastId = "import-toast";
    const formData = new FormData();
    formData.append('file', file);

    toast.info("Importando datos", { 
      description: "Por favor espere mientras procesamos el archivo...",
      duration: 0,
      id: toastId
    });

    if (onProgress) {
      onProgress("Preparando importación", 0, 0);
    }

    // Get authentication token
    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      toast.error("Error de autenticación", {
        description: "Error al obtener la sesión: " + sessionError.message,
        id: toastId
      });
      return { success: false, message: "Error al obtener la sesión" };
    }
    
    if (!data.session) {
      console.error("No active session");
      toast.error("Error de autenticación", {
        description: "No hay sesión activa. Por favor inicie sesión nuevamente.",
        id: toastId
      });
      return { success: false, message: "No hay sesión activa" };
    }
    
    const accessToken = data.session.access_token;
    
    if (!accessToken) {
      console.error("No access token in session");
      toast.error("Error de autenticación", {
        description: "No se pudo obtener el token de acceso. Por favor inicie sesión nuevamente.",
        id: toastId
      });
      return { success: false, message: "No se pudo obtener el token de acceso" };
    }
    
    if (onProgress) {
      onProgress("Subiendo archivo al servidor", 0, 0);
    }
    
    // Set up abort controller with longer timeout for large files
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 120000); // 2 minutes
    
    try {
      // Start the import process
      const initialResponse = await callImportApi(formData, accessToken, abortController);
      clearTimeout(timeoutId);
      
      // If we have a progress ID, start polling for progress updates
      if (initialResponse.progressId && onProgress) {
        // Set up progress polling
        let isComplete = false;
        let errorOccurred = false;
        
        // Poll for progress updates every 3 seconds
        const pollInterval = setInterval(async () => {
          try {
            const progressResponse = await checkImportProgress(initialResponse.progressId!);
            
            // If we got a successful response, the import is complete
            if (progressResponse.success) {
              isComplete = true;
              clearInterval(pollInterval);
              return handleImportResponse(progressResponse);
            }
            
            // Extract progress data from message if still in progress
            const messageMatch = progressResponse.message?.match(/(\d+) de (\d+)/);
            if (messageMatch && messageMatch.length === 3) {
              const processed = parseInt(messageMatch[1], 10);
              const total = parseInt(messageMatch[2], 10);
              if (!isNaN(processed) && !isNaN(total) && total > 0) {
                onProgress(progressResponse.message || "Procesando datos...", processed, total);
              }
            }
            
            // Check for error status
            if (progressResponse.message?.includes("Error")) {
              errorOccurred = true;
              clearInterval(pollInterval);
              return handleImportError(new Error(progressResponse.message), toastId);
            }
          } catch (pollError) {
            console.error("Error polling for progress:", pollError);
          }
        }, 3000);
        
        // Wait for completion or timeout after 10 minutes
        let timeoutCounter = 0;
        const maxTimeout = 200; // 10 minutes (200 * 3 seconds)
        
        return new Promise<ImportResponse>((resolve) => {
          const checkCompletion = setInterval(() => {
            timeoutCounter++;
            
            // If complete, resolve with success
            if (isComplete) {
              clearInterval(checkCompletion);
              resolve({ success: true, message: "Importación completada exitosamente" });
            } 
            // If error occurred, resolve with error
            else if (errorOccurred) {
              clearInterval(checkCompletion);
              clearInterval(pollInterval);
              resolve({ success: false, message: "Error durante la importación" });
            }
            // If timed out, resolve with timeout error
            else if (timeoutCounter >= maxTimeout) {
              clearInterval(checkCompletion);
              clearInterval(pollInterval);
              resolve({ 
                success: false, 
                message: "La importación está tomando demasiado tiempo. Por favor verifique el estado más tarde." 
              });
            }
          }, 3000);
        });
      }
      
      // If no progress ID, just handle the response directly
      return handleImportResponse(initialResponse);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      return handleImportError(fetchError, toastId);
    }
  } catch (error) {
    return handleImportError(error, "import-toast");
  }
}
