
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
    // Validar tamaño de archivo (aumentado a 30MB para manejar archivos grandes)
    if (file.size > 30 * 1024 * 1024) {
      toast.error("Archivo muy grande", {
        description: "El archivo excede el tamaño máximo permitido de 30 MB. Por favor, utilice un archivo más pequeño o divídalo en partes."
      });
      return { success: false, message: "El archivo excede el tamaño máximo permitido" };
    }
    
    // Validar tipo de archivo (debe ser Excel)
    const validExcelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    
    // También verificar por extensión por si el tipo MIME no es confiable
    const fileName = file.name.toLowerCase();
    const hasValidExtension = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    
    if (!validExcelTypes.includes(file.type) && !hasValidExtension) {
      toast.error("Tipo de archivo incorrecto", {
        description: "Por favor seleccione un archivo de Excel (.xls, .xlsx)."
      });
      return { success: false, message: "El formato de archivo no es válido. Solo se permiten archivos Excel (.xls, .xlsx)" };
    }
    
    console.log(`Importing file: ${file.name} (${file.size} bytes, type: ${file.type})`);
    
    const toastId = "import-toast";
    const formData = new FormData();
    formData.append('file', file);

    toast.loading("Subiendo archivo", { 
      description: "Por favor espere mientras subimos el archivo...",
      duration: 0,
      id: toastId
    });

    if (onProgress) {
      onProgress("Preparando importación", 0, 0);
    }

    // Obtener token de autenticación
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
      onProgress("Subiendo archivo al servidor", 0, file.size);
    }
    
    // Configurar abort controller con timeout más largo para archivos grandes
    const abortController = new AbortController();
    // 15 minutos de timeout para subida de archivos grandes (aumentado de 10 a 15)
    const timeoutId = setTimeout(() => abortController.abort(), 15 * 60 * 1000);
    
    try {
      // Iniciar el proceso de importación
      const initialResponse = await callImportApi(formData, accessToken, abortController);
      clearTimeout(timeoutId);
      
      console.log("Initial import response:", initialResponse);
      
      // Si tenemos un ID de progreso, comenzar el polling para actualizaciones de progreso
      if (initialResponse.progressId && onProgress) {
        // Configurar polling de progreso
        let isComplete = false;
        let errorOccurred = false;
        
        console.log("Starting progress polling for ID:", initialResponse.progressId);
        
        // Consultar actualizaciones de progreso cada 5 segundos (incrementado de 3 a 5)
        const pollInterval = setInterval(async () => {
          try {
            const progressData = await checkImportProgress(initialResponse.progressId!);
            console.log("Progress update:", progressData);
            
            // Actualizar callback de progreso con estado actual
            onProgress(
              progressData.message || "Procesando datos...", 
              progressData.processed, 
              progressData.total
            );
            
            // Verificar finalización
            if (progressData.status === 'completed' || progressData.status === 'completed_with_errors') {
              console.log(`Import completed${progressData.status === 'completed_with_errors' ? ' with errors' : ' successfully'}`);
              isComplete = true;
              clearInterval(pollInterval);
              
              // Si se completó con errores, convertir el progreso a respuesta para obtener los errores
              if (progressData.status === 'completed_with_errors') {
                return;
              }
            }
            
            // Verificar estado de error
            if (progressData.status === 'error') {
              console.error("Import failed:", progressData.message);
              errorOccurred = true;
              clearInterval(pollInterval);
              
              // Mostrar mensaje de error
              toast.error("Error en la importación", {
                description: progressData.message || "Se produjo un error durante la importación",
                id: toastId,
                duration: 5000
              });
              
              return;
            }
          } catch (pollError) {
            console.error("Error polling for progress:", pollError);
          }
        }, 5000); // Aumentado de 3000ms a 5000ms para reducir la carga del servidor
        
        // Esperar la finalización o timeout después de 45 minutos (incrementado de 30 a 45)
        let timeoutCounter = 0;
        const maxTimeout = 540; // 45 minutos (540 * 5 segundos)
        
        return new Promise<ImportResponse>((resolve) => {
          const checkCompletion = setInterval(() => {
            timeoutCounter++;
            
            // Si completado, resolver con éxito
            if (isComplete) {
              clearInterval(checkCompletion);
              toast.success("Importación completada", {
                description: "Los datos se han importado exitosamente",
                id: toastId
              });
              resolve({ 
                success: true, 
                message: "Importación completada exitosamente",
                errors: initialResponse.errors
              });
            } 
            // Si ocurrió un error, resolver con error
            else if (errorOccurred) {
              clearInterval(checkCompletion);
              clearInterval(pollInterval);
              toast.error("Error en la importación", {
                description: "Se produjo un error durante el proceso de importación",
                id: toastId
              });
              resolve({ success: false, message: "Error durante la importación" });
            }
            // Si timeout, resolver con error de timeout
            else if (timeoutCounter >= maxTimeout) {
              clearInterval(checkCompletion);
              clearInterval(pollInterval);
              toast.error("Timeout de importación", {
                description: "La importación está tomando demasiado tiempo. Por favor verifique el estado más tarde o intente con un archivo más pequeño.",
                id: toastId
              });
              resolve({ 
                success: false, 
                message: "La importación está tomando demasiado tiempo. Por favor verifique el estado más tarde." 
              });
            }
          }, 5000); // Aumentado de 3000ms a 5000ms para reducir la carga
        });
      }
      
      // Si no hay ID de progreso, manejar la respuesta directamente
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
