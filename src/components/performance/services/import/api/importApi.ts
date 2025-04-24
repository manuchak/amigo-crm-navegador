
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ImportResponse } from "../types";
import { supabase } from "@/integrations/supabase/client";

// Function to initialize progress tracking
async function initializeProgressTracking(fileSize: number): Promise<string> {
  const progressId = uuidv4();
  
  try {
    await supabase
      .from('import_progress')
      .upsert({
        id: progressId,
        status: 'validating',
        processed: 0,
        total: fileSize,
        message: 'Iniciando proceso de validación',
        created_at: new Date().toISOString()
      });
      
    return progressId;
  } catch (error) {
    console.error("Error initializing progress tracking:", error);
    // Return ID anyway - tracking will just be unavailable if this fails
    return progressId;
  }
}

export async function callImportApi(
  formData: FormData,
  accessToken: string,
  abortController: AbortController
): Promise<ImportResponse> {
  try {
    // Get the file from formData to determine its size
    const file = formData.get('file') as File;
    if (!file) {
      return { 
        success: false, 
        message: "No file provided in formData" 
      };
    }
    
    // Initialize progress tracking
    const progressId = await initializeProgressTracking(file.size);
    
    // Add progress ID to formData
    formData.append('progressId', progressId);
    
    const response = await fetch(
      `https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/import-servicios-data`,
      {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w',
          'X-Progress-ID': progressId
        }
      }
    );
    
    if (!response.ok) {
      let errorMessage = `Error del servidor: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      return { 
        success: false, 
        message: errorMessage,
        progressId
      };
    }

    const responseData = await response.json();
    return { ...responseData, progressId };
  } catch (error) {
    console.error("API call error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Error desconocido",
      error
    };
  }
}

// Add a function to check import progress
export async function checkImportProgress(progressId: string): Promise<ImportResponse> {
  try {
    const { data, error } = await supabase
      .from('import_progress')
      .select('*')
      .eq('id', progressId)
      .single();
      
    if (error) {
      console.error("Error checking import progress:", error);
      return {
        success: false,
        message: "Error al verificar el progreso de importación"
      };
    }
    
    if (!data) {
      return {
        success: false,
        message: "No se encontró información de progreso"
      };
    }
    
    // If status is 'error', treat as failure
    if (data.status === 'error') {
      return {
        success: false,
        message: data.message || "Error durante la importación"
      };
    }
    
    // If status is 'completed', treat as success
    if (data.status === 'completed') {
      return {
        success: true,
        message: data.message || "Importación completada exitosamente"
      };
    }
    
    // Still in progress
    return {
      success: false,
      message: data.message || `Procesando: ${data.processed} de ${data.total}`,
      progressId: data.id
    };
  } catch (error) {
    console.error("Error checking import progress:", error);
    return {
      success: false,
      message: "Error al consultar el estado de la importación"
    };
  }
}
