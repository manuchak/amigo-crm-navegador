
import { ImportResponse } from "../types";

export async function callImportApi(
  formData: FormData,
  accessToken: string,
  abortController?: AbortController
): Promise<ImportResponse> {
  try {
    const response = await fetch(
      'https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/import-servicios-data',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
        signal: abortController?.signal
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        return {
          success: false,
          message: errorJson.message || `Error ${response.status}: ${response.statusText}`,
          errors: errorJson.errors || []
        };
      } catch {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          errors: [{ message: errorText }]
        };
      }
    }

    const result = await response.json();
    return {
      success: result.success,
      message: result.message,
      progressId: result.progressId,
      insertedCount: result.insertedCount,
      totalCount: result.totalCount,
      errors: result.errors || []
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        message: 'La importación fue cancelada',
        errors: [{ message: 'Operación cancelada por el usuario' }]
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido durante la importación',
      errors: [{ message: error instanceof Error ? error.message : 'Error desconocido' }]
    };
  }
}

export async function checkImportProgress(progressId: string): Promise<{ status: string; message?: string; processed: number; total: number }> {
  try {
    const response = await fetch(
      `https://beefjsdgrdeiymzxwxru.supabase.co/rest/v1/import_progress?id=eq.${progressId}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const results = await response.json();
    
    if (!results || results.length === 0) {
      return { status: 'error', message: 'No se encontró información de progreso', processed: 0, total: 0 };
    }

    const progressData = results[0];
    return {
      status: progressData.status,
      message: progressData.message,
      processed: progressData.processed || 0,
      total: progressData.total || 0
    };
  } catch (error) {
    console.error('Error checking import progress:', error);
    return { 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Error desconocido', 
      processed: 0, 
      total: 0 
    };
  }
}

export async function testEdgeFunctionConnection(): Promise<boolean> {
  try {
    // Using a simple OPTIONS request to test connection - faster than a full request
    const response = await fetch(
      'https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/import-servicios-data',
      {
        method: 'OPTIONS',
        // Setting a shorter timeout using AbortController
        signal: AbortController ? new AbortController().signal : undefined
      }
    );
    
    // If we get a response at all, the connection is working
    return response.ok || response.status === 204;
  } catch (error) {
    console.error('Error testing edge function connection:', error);
    return false;
  }
}
