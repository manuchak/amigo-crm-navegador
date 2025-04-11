
import { CONFIG } from '../config.ts';

/**
 * VAPI Discovery Service
 * Handles API discovery and exploration
 */
export class VapiDiscoveryService {
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
}
