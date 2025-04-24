
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProgressCallback, ImportResponse } from "./types";
import { callImportApi, checkImportProgress } from "./api/importApi";
import { handleImportError } from "./utils/errorHandler";
import { handleImportResponse, progressToResponse } from "./utils/responseHandler";

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
    
    // Validate file type (must be Excel)
    const validExcelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    
    if (!validExcelTypes.includes(file.type)) {
      toast.error("Tipo de archivo incorrecto", {
        description: "Por favor seleccione un archivo de Excel (.xls, .xlsx)."
      });
      return { success: false, message: "El formato de archivo no es válido. Solo se permiten archivos Excel (.xls, .xlsx)" };
    }
    
    console.log(`Importing file: ${file.name} (${file.size} bytes, type: ${file.type})`);
    
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
    const timeoutId = setTimeout(() => abortController.abort(), 180000); // 3 minutes
    
    try {
      // Start the import process
      const initialResponse = await callImportApi(formData, accessToken, abortController);
      clearTimeout(timeoutId);
      
      console.log("Initial import response:", initialResponse);
      
      // If we have a progress ID, start polling for progress updates
      if (initialResponse.progressId && onProgress) {
        // Set up progress polling
        let isComplete = false;
        let errorOccurred = false;
        
        console.log("Starting progress polling for ID:", initialResponse.progressId);
        
        // Poll for progress updates every 3 seconds
        const pollInterval = setInterval(async () => {
          try {
            const progressData = await checkImportProgress(initialResponse.progressId!);
            console.log("Progress update:", progressData);
            
            // Update progress callback with current status
            onProgress(
              progressData.message || "Procesando datos...", 
              progressData.processed, 
              progressData.total
            );
            
            // Check for completion
            if (progressData.status === 'completed') {
              console.log("Import completed successfully");
              isComplete = true;
              clearInterval(pollInterval);
              return;
            }
            
            // Check for error status
            if (progressData.status === 'error') {
              console.error("Import failed:", progressData.message);
              errorOccurred = true;
              clearInterval(pollInterval);
              return;
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
    console.error("Unhandled error in import process:", error);
    return handleImportError(error, "import-toast");
  }
}
