
import { toast } from "sonner";

export function handleImportError(error: unknown, toastId?: string): { success: false; message: string; errors?: any[] } {
  console.error("Import error:", error);
  
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante la importación';
  
  if (toastId) {
    toast.error("Error en la importación", {
      description: errorMessage,
      id: toastId
    });
  }
  
  return {
    success: false,
    message: errorMessage,
    errors: [{ message: errorMessage }]
  };
}
