
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
      let errorDescription = "";
      
      if (responseData.errors.length === 1) {
        errorDescription = `Error: ${responseData.errors[0].message}`;
      } else if (responseData.errors.length <= 3) {
        errorDescription = responseData.errors.map((err: any) => 
          err.batch ? `Lote ${err.batch}: ${err.message}` : `Error: ${err.message}`
        ).join('\n');
      } else {
        errorDescription = `Se encontraron ${responseData.errors.length} errores. Revise los detalles para más información.`;
      }
      
      toast.error("Errores en la importación", {
        description: errorDescription,
        duration: 5000,
        id: "import-toast"
      });
    } else {
      toast.error("Error al importar datos", {
        description: responseData.message || "Revise el formato del archivo",
        id: "import-toast"
      });
    }
    
    return { success: false, errors: responseData.errors, message: responseData.message };
  }

  // Mensaje de éxito personalizado según la cantidad de registros
  let successMessage = responseData.message;
  
  if (responseData.insertedCount && responseData.totalCount) {
    if (responseData.insertedCount === responseData.totalCount) {
      successMessage = `Se importaron ${responseData.insertedCount} registros exitosamente`;
    } else {
      successMessage = `Se importaron ${responseData.insertedCount} de ${responseData.totalCount} registros`;
      
      if (responseData.errors && responseData.errors.length > 0) {
        successMessage += ` (${responseData.errors.length} errores)`;
      }
    }
  }

  toast.success("Datos importados exitosamente", {
    description: successMessage,
    id: "import-toast",
    duration: 5000
  });
  
  return { 
    success: true, 
    message: successMessage,
    errors: responseData.errors,
    insertedCount: responseData.insertedCount,
    totalCount: responseData.totalCount
  };
}

// Convertir ImportProgress a ImportResponse
export function progressToResponse(progress: ImportProgress): ImportResponse {
  if (progress.status === 'error') {
    return {
      success: false,
      message: progress.message,
      progressId: progress.id
    };
  }
  
  if (progress.status === 'completed' || progress.status === 'completed_with_errors') {
    return {
      success: true,
      message: progress.message,
      progressId: progress.id
    };
  }
  
  // Todavía en progreso
  return {
    success: false,
    message: progress.message || `Procesando: ${progress.processed} de ${progress.total}`,
    progressId: progress.id
  };
}
