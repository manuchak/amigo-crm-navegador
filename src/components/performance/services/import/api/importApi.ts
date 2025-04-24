
import { toast } from "sonner";
import { ImportResponse } from "../types";

export async function callImportApi(
  formData: FormData,
  accessToken: string,
  abortController: AbortController
): Promise<ImportResponse> {
  const response = await fetch(
    `https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/import-servicios-data`,
    {
      method: 'POST',
      body: formData,
      signal: abortController.signal,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w'
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
      message: errorMessage 
    };
  }

  return await response.json();
}
