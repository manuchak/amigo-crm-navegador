
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProgressCallback, ImportResponse } from "./types";
import { callImportApi } from "./api/importApi";
import { handleImportError } from "./utils/errorHandler";
import { handleImportResponse } from "./utils/responseHandler";

export async function importServiciosData(
  file: File, 
  onProgress?: ProgressCallback
): Promise<ImportResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    toast.info("Importando datos", { 
      description: "Por favor espere mientras procesamos el archivo...",
      duration: 0,
      id: "import-toast"
    });

    if (onProgress) {
      onProgress("Preparando importación", 0, 0);
    }

    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      toast.error("Error de autenticación", {
        description: "Error al obtener la sesión: " + sessionError.message
      });
      return { success: false, message: "Error al obtener la sesión" };
    }
    
    if (!data.session) {
      console.error("No active session");
      toast.error("Error de autenticación", {
        description: "No hay sesión activa. Por favor inicie sesión nuevamente."
      });
      return { success: false, message: "No hay sesión activa" };
    }
    
    const accessToken = data.session.access_token;
    
    if (!accessToken) {
      console.error("No access token in session");
      toast.error("Error de autenticación", {
        description: "No se pudo obtener el token de acceso. Por favor inicie sesión nuevamente."
      });
      return { success: false, message: "No se pudo obtener el token de acceso" };
    }
    
    if (onProgress) {
      onProgress("Subiendo archivo al servidor", 0, 0);
    }
    
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 25000);
    
    try {
      const responseData = await callImportApi(formData, accessToken, abortController);
      clearTimeout(timeoutId);
      return handleImportResponse(responseData);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      return handleImportError(fetchError, "import-toast");
    }
  } catch (error) {
    return handleImportError(error, "import-toast");
  }
}
