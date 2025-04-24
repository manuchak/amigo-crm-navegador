
import { toast } from "sonner";
import { ImportProgress, ImportResponse } from "../types";

export function handleImportResponse(responseData: any): ImportResponse {
  console.log("Processing import response:", responseData);
  
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
      const errorMessages = responseData.errors.map((err: any) => 
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
}

// Convert ImportProgress to ImportResponse
export function progressToResponse(progress: ImportProgress): ImportResponse {
  if (progress.status === 'error') {
    return {
      success: false,
      message: progress.message,
      progressId: progress.id
    };
  }
  
  if (progress.status === 'completed') {
    return {
      success: true,
      message: progress.message,
      progressId: progress.id
    };
  }
  
  // Still in progress
  return {
    success: false,
    message: progress.message || `Procesando: ${progress.processed} de ${progress.total}`,
    progressId: progress.id
  };
}
