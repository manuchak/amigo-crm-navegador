
/**
 * VAPI Call Enhancer
 * Enhances call logs with additional data
 */
export class VapiCallEnhancer {
  /**
   * Enhance call logs with customer data from the GET /call endpoint
   * As recommended in VAPI documentation
   */
  static async enhanceCallsWithCustomerData(calls, apiKey) {
    if (!calls || !Array.isArray(calls) || calls.length === 0) {
      return calls;
    }
    
    try {
      console.log(`Enhancing ${calls.length} call logs with customer data`);
      const enhancedCalls = [];
      
      for (const call of calls) {
        // Add the call to the result list (we'll process it even if we can't get details)
        const enhancedCall = { ...call };
        enhancedCalls.push(enhancedCall);
        
        // Skip if already has detailed customer number
        if (call.customer && call.customer.number && call.customer.number.length > 6) {
          console.log(`Call ${call.id} already has customer number: ${call.customer.number}`);
          enhancedCall.customer_number = call.customer.number;
          
          // Add E164 format information if available
          if (!enhancedCall.metadata) enhancedCall.metadata = {};
          enhancedCall.metadata.numberE164Format = call.customer.numberE164CheckEnabled !== false;
          continue;
        }
        
        try {
          // Fetch detailed call information via GET /call endpoint
          if (call.id) {
            const callDetails = await VapiCallEnhancer.fetchCallDetails(apiKey, call.id);
            
            if (callDetails && callDetails.customer && callDetails.customer.number) {
              const customerPhone = callDetails.customer.number;
              console.log(`Found customer number ${customerPhone} for call ${call.id}`);
              
              // Update call with proper customer phone info
              enhancedCall.customer_number = customerPhone;
              
              // Add to metadata for extra assurance
              if (!enhancedCall.metadata) enhancedCall.metadata = {};
              enhancedCall.metadata.vapi_customer_number = customerPhone;
              enhancedCall.metadata.numberE164Format = callDetails.customer.numberE164CheckEnabled !== false;
            }
          }
        } catch (detailsError) {
          console.error(`Error enhancing call ${call.id} with customer details:`, detailsError);
          // Continue processing other calls even if one fails
        }
      }
      
      return enhancedCalls;
    } catch (error) {
      console.error('Error in enhanceCallsWithCustomerData:', error);
      // Return original calls if enhancement fails
      return calls;
    }
  }
  
  /**
   * Fetch detailed call information including customer data
   * Using the GET /call/{id} endpoint as per VAPI documentation
   */
  static async fetchCallDetails(apiKey, callId) {
    try {
      console.log(`Fetching detailed call information for call ID: ${callId}`);
      const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error(`Call details API error: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      console.log('Call details response structure:', Object.keys(data));
      
      // Extract customer information as per VAPI docs
      if (data && data.customer && data.customer.number) {
        console.log(`Found customer phone number: ${data.customer.number} (E164 format: ${data.customer.numberE164CheckEnabled !== false})`);
        return data;
      } else {
        console.log('No customer information found in call details', data);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching call details:', error);
      return null;
    }
  }
}
