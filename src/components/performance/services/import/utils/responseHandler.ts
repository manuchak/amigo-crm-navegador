
import { ImportResponse } from "../types";
import { toast } from "sonner";

export function handleImportResponse(response: ImportResponse): ImportResponse {
  // If there's a toast ID provided, update it
  const toastId = "import-toast";
  
  if (!response.success) {
    toast.error("Error en la importación", {
      description: response.message,
      id: toastId
    });
    return response;
  }
  
  if (response.errors && response.errors.length > 0) {
    toast.warning("Importación completada con advertencias", {
      description: `Se importaron ${response.insertedCount} registros pero ocurrieron ${response.errors.length} errores`,
      id: toastId
    });
  } else {
    toast.success("Importación completada", {
      description: `Se importaron ${response.insertedCount} registros correctamente`,
      id: toastId
    });
  }
  
  return response;
}
