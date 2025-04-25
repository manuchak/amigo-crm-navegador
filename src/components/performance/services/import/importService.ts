
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProgressCallback, ImportResponse } from "./types";
import { callImportApi, checkImportProgress, testEdgeFunctionConnection } from "./api/importApi";
import { handleImportError } from "./utils/errorHandler";
import { handleImportResponse } from "./utils/responseHandler";

// Constantes para límites y configuración
const MAX_FILE_SIZE_MB = 5; // Reducido a 5MB para prevenir errores de recursos
const MAX_ALLOWED_FILE_SIZE_MB = 15; // Límite absoluto máximo

export async function importServiciosData(
  file: File, 
  onProgress?: ProgressCallback
): Promise<ImportResponse> {
  try {
    // Validar tamaño de archivo con un límite más restrictivo
    if (file.size > MAX_ALLOWED_FILE_SIZE_MB * 1024 * 1024) {
      toast.error("Archivo demasiado grande", {
        description: `El archivo excede el tamaño máximo permitido de ${MAX_ALLOWED_FILE_SIZE_MB} MB. Por favor, divida el archivo en partes más pequeñas.`
      });
      return { success: false, message: `El archivo excede el tamaño máximo permitido de ${MAX_ALLOWED_FILE_SIZE_MB} MB` };
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

    toast.loading("Preparando importación", { 
      description: "Verificando conexión con el servidor...",
      duration: 0,
      id: toastId
    });

    if (onProgress) {
      onProgress("Verificando conexión con el servidor", 0, 0);
    }
    
    // Mostrar advertencia si el archivo es grande pero está dentro del límite permitido
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.warning("Archivo grande detectado", {
        description: `El archivo es grande (${(file.size / (1024 * 1024)).toFixed(1)} MB). La importación puede tardar varios minutos y podría fallar debido a limitaciones de recursos.`,
        duration: 6000
      });
    }
    
    // Verificar la conectividad con la función Edge antes de iniciar
    const isConnected = await testEdgeFunctionConnection();
    
    if (!isConnected) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor de importación. Verifique su conexión a internet.",
        id: toastId
      });
      
      return { success: false, message: "Error de conectividad con el servidor de importación" };
    }

    toast.loading("Validando archivo", { 
      description: "Verificando formato y estructura de datos...",
      duration: 0,
      id: toastId
    });

    if (onProgress) {
      onProgress("Validando estructura del archivo", 0, 0);
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
    
    // Configurar abort controller con timeout más corto para archivos grandes
    const abortController = new AbortController();
    // 10 minutos de timeout, aumentado de 5 para evitar cortes prematuros
    const timeoutId = setTimeout(() => {
      console.warn("Timeout alcanzado, abortando operación");
      abortController.abort();
    }, 10 * 60 * 1000);
    
    try {
      // Iniciar el proceso de importación con reintentos automáticos
      console.log("Llamando a importar...");
      const initialResponse = await callImportApi(formData, accessToken, abortController);
      clearTimeout(timeoutId);
      
      console.log("Initial import response:", initialResponse);
      
      // Si tenemos un ID de progreso, comenzar el polling para actualizaciones de progreso
      if (initialResponse.progressId && onProgress) {
        // Configurar polling de progreso
        let isComplete = false;
        let errorOccurred = false;
        
        console.log("Starting progress polling for ID:", initialResponse.progressId);
        
        // Consultar actualizaciones de progreso cada 3 segundos (reducido de 5 para feedback más frecuente)
        const pollInterval = setInterval(async () => {
          try {
            console.log("Verificando progreso para ID:", initialResponse.progressId);
            const progressData = await checkImportProgress(initialResponse.progressId!);
            console.log("Progress update:", progressData);
            
            // Actualizar callback de progreso con estado actual
            if (progressData && progressData.status) {
              onProgress(
                progressData.message || "Procesando datos...", 
                progressData.processed, 
                progressData.total
              );
            }
            
            // Verificar finalización
            if (progressData.status === 'completed' || progressData.status === 'completed_with_errors') {
              console.log(`Import completed${progressData.status === 'completed_with_errors' ? ' with errors' : ' successfully'}`);
              isComplete = true;
              clearInterval(pollInterval);
              
              // Mostrar mensaje de éxito/advertencia según corresponda
              if (progressData.status === 'completed') {
                toast.success("Importación completada", {
                  description: progressData.message || "Los datos se han importado exitosamente",
                  id: toastId
                });
              } else {
                toast.warning("Importación completada con errores", {
                  description: progressData.message || "Algunos registros no pudieron ser importados",
                  id: toastId
                });
              }
              
              return;
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
        }, 3000); // Reducido de 5000ms a 3000ms
        
        // Esperar la finalización o timeout después de 15 minutos (reducido de 20)
        let timeoutCounter = 0;
        const maxTimeout = 300; // 15 minutos (300 * 3 segundos)
        
        return new Promise<ImportResponse>((resolve) => {
          const checkCompletion = setInterval(() => {
            timeoutCounter++;
            
            // Si completado, resolver con éxito
            if (isComplete) {
              clearInterval(checkCompletion);
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
              resolve({ success: false, message: "Error durante la importación" });
            }
            // Si timeout, resolver con error de timeout
            else if (timeoutCounter >= maxTimeout) {
              clearInterval(checkCompletion);
              clearInterval(pollInterval);
              toast.error("Timeout de importación", {
                description: "La importación está tomando demasiado tiempo. Por favor intente con un archivo más pequeño.",
                id: toastId
              });
              resolve({ 
                success: false, 
                message: "La importación está tomando demasiado tiempo. Por favor verifique el estado más tarde." 
              });
            }
          }, 3000); // Reducido para coincidir con el intervalo de polling
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
