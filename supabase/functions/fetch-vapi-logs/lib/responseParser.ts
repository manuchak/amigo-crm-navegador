
/**
 * Handles parsing and normalizing API responses
 */
export class ResponseParser {
  /**
   * Extract logs from different response formats
   */
  static extractLogsFromResponse(responseData: any): any[] {
    // Handle the v2 API format where calls are in a 'calls' array
    if (responseData && responseData.calls && Array.isArray(responseData.calls)) {
      console.log(`Extracted ${responseData.calls.length} calls from calls array`);
      return responseData.calls;
    }
    
    // Handle array responses directly
    if (Array.isArray(responseData)) {
      console.log(`Response is already an array with ${responseData.length} items`);
      return responseData;
    }
    
    // Handle data.results format
    if (responseData && responseData.data && Array.isArray(responseData.data.results)) {
      console.log(`Extracted ${responseData.data.results.length} calls from data.results`);
      return responseData.data.results;
    }
    
    // Handle data.logs format
    if (responseData && responseData.data && Array.isArray(responseData.data.logs)) {
      console.log(`Extracted ${responseData.data.logs.length} calls from data.logs`);
      return responseData.data.logs;
    }
    
    // Handle results array directly
    if (responseData && Array.isArray(responseData.results)) {
      console.log(`Extracted ${responseData.results.length} calls from results array`);
      return responseData.results;
    }
    
    // Handle logs array directly
    if (responseData && Array.isArray(responseData.logs)) {
      console.log(`Extracted ${responseData.logs.length} calls from logs array`);
      return responseData.logs;
    }
    
    // Handle data array directly
    if (responseData && Array.isArray(responseData.data)) {
      console.log(`Extracted ${responseData.data.length} calls from data array`);
      return responseData.data;
    }
    
    // Log the response structure for debugging
    console.log("Response structure:", Object.keys(responseData || {}));
    console.log("Could not determine response format, returning empty array");
    
    // Default to empty array if no recognizable format
    return [];
  }
}
