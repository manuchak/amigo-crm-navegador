
/**
 * VAPI Phone Manager
 * Handles phone number extraction and management
 */
export class VapiPhoneManager {
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
}
