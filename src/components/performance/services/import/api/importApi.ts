
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ImportResponse, ImportProgress } from "../types";
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
    
    console.log(`Preparing to upload file: ${file.name}, size: ${file.size} bytes`);
    
    // Initialize progress tracking
    const progressId = await initializeProgressTracking(file.size);
    console.log(`Created progress tracking with ID: ${progressId}`);
    
    // Add progress ID to formData
    formData.append('progressId', progressId);
    
    // Ensure we're using the correct URL and headers
    const apiUrl = 'https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/import-servicios-data';
    console.log(`Sending request to: ${apiUrl}`);
    
    const response = await fetch(
      apiUrl,
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
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = `Error del servidor: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("Server error details:", errorData);
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
    console.log("API success response:", responseData);
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
export async function checkImportProgress(progressId: string): Promise<ImportProgress> {
  try {
    console.log(`Checking progress for ID: ${progressId}`);
    
    const { data, error } = await supabase
      .from('import_progress')
      .select('*')
      .eq('id', progressId)
      .single();
      
    if (error) {
      console.error("Error checking import progress:", error);
      return {
        id: progressId,
        status: 'error',
        processed: 0,
        total: 0,
        message: "Error al verificar el progreso de importación"
      };
    }
    
    if (!data) {
      console.warn("No progress data found for ID:", progressId);
      return {
        id: progressId,
        status: 'error',
        processed: 0,
        total: 0,
        message: "No se encontró información de progreso"
      };
    }
    
    console.log("Progress data retrieved:", data);
    return data as ImportProgress;
  } catch (error) {
    console.error("Exception checking import progress:", error);
    return {
      id: progressId,
      status: 'error',
      processed: 0,
      total: 0,
      message: "Error al consultar el estado de la importación"
    };
  }
}
