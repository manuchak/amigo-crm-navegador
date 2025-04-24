
import { toast } from "sonner";
import { ImportResponse } from "../types";

export function handleImportError(error: unknown, toastId: string): ImportResponse {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      console.error("Request timed out");
      toast.error("La importación está tomando demasiado tiempo", {
        description: "El archivo es muy grande y puede causar problemas de recursos. Intente con un archivo más pequeño.",
        id: toastId
      });
      return { 
        success: false, 
        message: "La operación excedió el tiempo límite" 
      };
    }
  }
  
  console.error("Error importing servicios data:", error);
  toast.error("Error al importar servicios", {
    description: error instanceof Error ? error.message : "Error de comunicación con el servidor",
    id: toastId
  });
  
  return { success: false, error };
}
