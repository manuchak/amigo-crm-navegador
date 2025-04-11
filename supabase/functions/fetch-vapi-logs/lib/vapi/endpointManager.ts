
import { CONFIG } from '../config.ts';

/**
 * VAPI Endpoint Manager
 * Handles configuration and formatting of API endpoints
 */
export class VapiEndpointManager {
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
}
