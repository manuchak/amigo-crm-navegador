
import { CONFIG } from './config.ts';
import { ResponseParser } from './responseParser.ts';

/**
 * VAPI API Client
 */
export class VapiApiClient {
  /**
   * Format query parameters for an endpoint
   */
  static formatParams(endpointConfig, startDate, endDate) {
    // Basic parameters without the problematic includeMetadata
    const params = new URLSearchParams({
      assistantId: CONFIG.VAPI_ASSISTANT_ID,
      limit: '100'
    });
    
    // Only add date range if supported by endpoint
    if (endpointConfig.supportsDates) {
      params.append('startTime', startDate);
      params.append('endTime', endDate);
    }
    
    console.log(`Formatted parameters for ${endpointConfig.url}: ${params.toString()}`);
    return params.toString();
  }
  
  /**
   * Get all endpoint configurations
   */
  static getEndpointConfigs() {
    return CONFIG.API_ENDPOINTS.map(endpoint => {
      return {
        url: endpoint.url,
        method: endpoint.method,
        description: endpoint.description,
        supportsDates: endpoint.supportsDates
      }
    })
  }
  
  /**
   * Try API discovery as a last resort
   */
  static async tryApiDiscovery(apiKey) {
    try {
      console.log("Trying API discovery endpoint");
      // First try simple authentication check that doesn't require parameters
      const authCheckUrl = 'https://api.vapi.ai/assistant';
      const authCheckResponse = await fetch(authCheckUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!authCheckResponse.ok) {
        console.error(`Authentication check failed with status: ${authCheckResponse.status}`);
        console.log(`Response body: ${await authCheckResponse.text()}`);
        return null;
      }
      
      console.log("Authentication successful, trying to discover endpoints");
      
      // Now try to discover available endpoints
      const apiUrl = 'https://api.vapi.ai/api';
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error(`API discovery returned status: ${response.status}`);
        return null;
      }
      
      try {
        const apiDoc = await response.json();
        console.log("API discovery data:", JSON.stringify(apiDoc).substring(0, 200) + '...');
        
        // Try to find relevant endpoints
        return null; // We'll analyze the response manually and update the endpoint list
      } catch (parseError) {
        console.error("Error parsing API discovery response:", parseError);
        // Try a direct call to the most likely endpoint
        const directCallUrl = `https://api.vapi.ai/assistant/${CONFIG.VAPI_ASSISTANT_ID}/calls`;
        console.log(`Trying direct endpoint: ${directCallUrl}`);
        
        const directCallResponse = await fetch(directCallUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (directCallResponse.ok) {
          return await directCallResponse.json();
        }
        
        return null;
      }
    } catch (error) {
      console.error("Error with API discovery:", error);
      return null;
    }
  }
  
  /**
   * Fetch phone number details from VAPI
   */
  static async fetchPhoneNumberDetails(apiKey, phoneNumberId) {
    try {
      console.log(`Fetching phone number details for ID: ${phoneNumberId}`);
      const response = await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error(`Phone number API error: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      console.log('Phone number details:', JSON.stringify(data).substring(0, 200) + '...');
      return data;
    } catch (error) {
      console.error('Error fetching phone number details:', error);
      return null;
    }
  }
  
  /**
   * Fetch logs from VAPI API trying multiple endpoints
   */
  static async fetchLogs(apiKey, startDate, endDate) {
    const endpoints = this.getEndpointConfigs();
    let lastError = null;
    let responseResults = null;
    
    // Try VAPI v2 API first
    try {
      console.log("Attempting to use VAPI v2 API");
      const v2Url = `https://api.vapi.ai/assistant/${CONFIG.VAPI_ASSISTANT_ID}/calls?page=1&limit=50`;
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
          
          // Enhance with phone number details for each call
          const enhancedCalls = await this.enhanceCallsWithPhoneDetails(data.calls, apiKey);
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
        
        const params = this.formatParams(endpoint, startDate, endDate);
        const requestUrl = `${endpoint.url}?${params}`;
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
      return await this.enhanceCallsWithPhoneDetails(logs, apiKey);
    }
    
    // Try API discovery as a last resort
    const discoveryData = await this.tryApiDiscovery(apiKey);
    if (discoveryData) {
      return ResponseParser.extractLogsFromResponse(discoveryData);
    }
    
    // If all attempts failed, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new Error("All VAPI API endpoints failed");
  }
  
  /**
   * Enhance call logs with phone number details
   */
  static async enhanceCallsWithPhoneDetails(calls, apiKey) {
    if (!calls || !Array.isArray(calls) || calls.length === 0) {
      return calls;
    }
    
    try {
      console.log(`Enhancing ${calls.length} call logs with phone details`);
      const enhancedCalls = [];
      
      for (const call of calls) {
        // Add the call to the result list (we'll process it even if we can't get phone details)
        enhancedCalls.push(call);
        
        // Skip if already has phone numbers
        if (
          (call.customer_number && call.customer_number.length > 6) || 
          (call.caller_phone_number && call.caller_phone_number.length > 6)
        ) {
          continue;
        }
        
        // Check if call has phone ID we can use
        const phoneNumberId = this.getPhoneNumberIdFromCall(call);
        if (!phoneNumberId) {
          console.log(`No phone number ID found for call ${call.id || 'unknown'}`);
          continue;
        }
        
        try {
          // Fetch detailed phone information
          const phoneDetails = await this.fetchPhoneNumberDetails(apiKey, phoneNumberId);
          if (phoneDetails) {
            // Extract phone number from the details
            const phone = phoneDetails.number || 
                         (phoneDetails.fallbackDestination && phoneDetails.fallbackDestination.number);
            
            if (phone) {
              console.log(`Found phone number ${phone} for call ${call.id || 'unknown'}`);
              
              // Update call with phone info
              // Determine if this is likely customer or caller number based on call direction
              if (call.direction === 'inbound') {
                call.caller_phone_number = call.caller_phone_number || phone;
              } else {
                call.customer_number = call.customer_number || phone;
              }
              
              // Always set phone_number as fallback
              call.phone_number = call.phone_number || phone;
              
              // Add to metadata for extra assurance
              if (!call.metadata) call.metadata = {};
              call.metadata.enhanced_phone = phone;
            }
          }
        } catch (phoneError) {
          console.error(`Error enhancing call ${call.id} with phone details:`, phoneError);
          // Continue processing other calls even if one fails
        }
      }
      
      return enhancedCalls;
    } catch (error) {
      console.error('Error in enhanceCallsWithPhoneDetails:', error);
      // Return original calls if enhancement fails
      return calls;
    }
  }
  
  /**
   * Extract phone number ID from call data
   */
  static getPhoneNumberIdFromCall(call) {
    if (!call) return null;
    
    // Check direct fields
    if (call.phone_number_id) return call.phone_number_id;
    if (call.phoneNumberId) return call.phoneNumberId;
    
    // Check metadata
    if (call.metadata && typeof call.metadata === 'object') {
      if (call.metadata.phone_number_id) return call.metadata.phone_number_id;
      if (call.metadata.phoneNumberId) return call.metadata.phoneNumberId;
    }
    
    return null;
  }
}
