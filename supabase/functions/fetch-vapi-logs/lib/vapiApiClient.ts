
import { VapiApiClient as Client } from './vapi/index.ts';

/**
 * Re-export VapiApiClient for backward compatibility
 */
export class VapiApiClient {
  static async fetchLogs(apiKey, startDate, endDate) {
    return Client.fetchLogs(apiKey, startDate, endDate);
  }
  
  static formatParams(endpointConfig, startDate, endDate) {
    // Import the required function from the reorganized modules
    const { VapiEndpointManager } = await import('./vapi/index.ts');
    return VapiEndpointManager.formatParams(endpointConfig, startDate, endDate);
  }
  
  static getEndpointConfigs() {
    // Import the required function from the reorganized modules
    const { VapiEndpointManager } = await import('./vapi/index.ts');
    return VapiEndpointManager.getEndpointConfigs();
  }
  
  static async tryApiDiscovery(apiKey) {
    // Import the required function from the reorganized modules
    const { VapiDiscoveryService } = await import('./vapi/index.ts');
    return VapiDiscoveryService.tryApiDiscovery(apiKey);
  }
  
  static async fetchPhoneNumberDetails(apiKey, phoneNumberId) {
    // Import the required function from the reorganized modules
    const { VapiPhoneManager } = await import('./vapi/index.ts');
    return VapiPhoneManager.fetchPhoneNumberDetails(apiKey, phoneNumberId);
  }
  
  static async fetchCallDetails(apiKey, callId) {
    // Import the required function from the reorganized modules
    const { VapiCallEnhancer } = await import('./vapi/index.ts');
    return VapiCallEnhancer.fetchCallDetails(apiKey, callId);
  }
  
  static async enhanceCallsWithCustomerData(calls, apiKey) {
    // Import the required function from the reorganized modules
    const { VapiCallEnhancer } = await import('./vapi/index.ts');
    return VapiCallEnhancer.enhanceCallsWithCustomerData(calls, apiKey);
  }
  
  static getPhoneNumberIdFromCall(call) {
    // Import the required function from the reorganized modules
    const { VapiPhoneManager } = await import('./vapi/index.ts');
    return VapiPhoneManager.getPhoneNumberIdFromCall(call);
  }
}
