
import { CONFIG } from '../config.ts';
import { VapiEndpointManager } from './endpointManager.ts';
import { VapiPhoneManager } from './phoneManager.ts';
import { VapiDiscoveryService } from './discoveryService.ts';
import { VapiCallEnhancer } from './callEnhancer.ts';
import { ResponseParser } from '../responseParser.ts';

/**
 * VAPI API Client
 * Main class for interacting with the VAPI API
 */
export class VapiApiClient {
  /**
   * Fetch logs from VAPI API trying multiple endpoints
   */
  static async fetchLogs(apiKey, startDate, endDate) {
    const endpoints = VapiEndpointManager.getEndpointConfigs();
    let lastError = null;
    let responseResults = null;
    
    // Try VAPI v2 API first
    try {
      console.log("Attempting to use VAPI v2 API");
      // Use a larger limit to ensure we get as many calls as possible
      // Include parameters for success_evaluation if available
      const v2Url = `https://api.vapi.ai/assistant/${CONFIG.VAPI_ASSISTANT_ID}/calls?page=1&limit=100&include_success=true&include_evaluation=true`;
      console.log(`Trying VAPI v2 URL: ${v2Url}`);
      
      const v2Response = await fetch(v2Url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (v2Response.ok) {
        const data = await v2Response.json();
        console.log("VAPI v2 API successful!");
        console.log("Response preview:", JSON.stringify(data).substring(0, 200) + '...');
        
        if (data && data.calls && Array.isArray(data.calls)) {
          console.log(`Retrieved ${data.calls.length} calls from VAPI v2 API`);
          console.log("Sample call data:", JSON.stringify(data.calls[0]).substring(0, 500));
          
          // Check if success_evaluation is present in the response
          if (data.calls.length > 0) {
            console.log("Success evaluation field present:", 
              data.calls[0].success_evaluation !== undefined || 
              data.calls[0].success !== undefined || 
              data.calls[0].evaluation !== undefined);
          }
          
          // Enhance with detailed call information including customer data
          const enhancedCalls = await VapiCallEnhancer.enhanceCallsWithCustomerData(data.calls, apiKey);
          return enhancedCalls;
        }
      } else {
        console.log(`VAPI v2 API failed with status: ${v2Response.status}`);
        console.log(`Response body: ${await v2Response.text()}`);
      }
    } catch (v2Error) {
      console.error("Error with VAPI v2 API:", v2Error);
    }
    
    // Try each endpoint from our config
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying VAPI endpoint: ${endpoint.url} with ${endpoint.method} method`);
        
        // Add parameters to specifically request success evaluation if supported
        const params = VapiEndpointManager.formatParams(endpoint, startDate, endDate);
        let requestUrl = `${endpoint.url}?${params}`;
        
        // Add success evaluation parameters if not already included
        if (!requestUrl.includes('include_success')) {
          requestUrl += '&include_success=true&include_evaluation=true';
        }
        
        console.log(`Full GET URL: ${requestUrl}`);
        
        const response = await fetch(requestUrl, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`VAPI API error response (${endpoint.url}): ${response.status}`, errorText);
          lastError = new Error(`VAPI API returned ${response.status}: ${errorText}`);
          continue;
        }
        
        const data = await response.json();
        console.log(`Success with ${endpoint.url}! Response:`, JSON.stringify(data).substring(0, 200) + '...');
        responseResults = data;
        break; // Exit the loop if we get a successful response
      } catch (error) {
        console.error(`Error with ${endpoint.url}:`, error);
        lastError = error;
      }
    }
    
    // If we got results from one of the endpoints, return them
    if (responseResults) {
      const logs = ResponseParser.extractLogsFromResponse(responseResults);
      return await VapiCallEnhancer.enhanceCallsWithCustomerData(logs, apiKey);
    }
    
    // Try API discovery as a last resort
    const discoveryData = await VapiDiscoveryService.tryApiDiscovery(apiKey);
    if (discoveryData) {
      return ResponseParser.extractLogsFromResponse(discoveryData);
    }
    
    // If all attempts failed, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new Error("All VAPI API endpoints failed");
  }
}
