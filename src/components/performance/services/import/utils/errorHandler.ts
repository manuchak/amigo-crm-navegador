
import { toast } from "sonner";
import { ImportResponse } from "../types";

export function handleImportError(error: unknown, toastId: string): ImportResponse {
  console.error("Import error details:", error);
  
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      console.log("Import was canceled by user or timed out");
      toast.error("La importación fue cancelada", {
        description: "La operación fue cancelada o excedió el tiempo límite.",
        id: toastId
      });
      return { 
        success: false, 
        message: "La operación fue cancelada" 
      };
    }
    
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor. Por favor, verifique su conexión e intente nuevamente.",
        id: toastId
      });
      return { 
        success: false, 
        message: "Error de conexión con el servidor" 
      };
    }
  }
  
  toast.error("Error al importar servicios", {
    description: error instanceof Error ? error.message : "Error de comunicación con el servidor",
    id: toastId
  });
  
  return { success: false, error };
}
