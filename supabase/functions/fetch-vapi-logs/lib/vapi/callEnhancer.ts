/**
 * Enhances call data with additional information from other API endpoints
 */
export class VapiCallEnhancer {
  /**
   * Fetch detailed call information for a specific call ID
   */
  static async fetchCallDetails(apiKey: string, callId: string) {
    try {
      console.log(`Fetching detailed information for call ${callId}`);
      
      // Try the v2 call details endpoint
      const detailsUrl = `https://api.vapi.ai/call/${callId}?include_success=true&include_evaluation=true`;
      
      const response = await fetch(detailsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch call details for ${callId}: ${response.status}`);
        return null;
      }
      
      const callData = await response.json();
      console.log(`Call details fetched for ${callId}`, JSON.stringify(callData).substring(0, 200) + '...');
      
      // Check if success_evaluation is present
      if (callData.success_evaluation !== undefined || callData.success !== undefined || callData.evaluation !== undefined) {
        console.log(`Success evaluation found for call ${callId}:`, 
          callData.success_evaluation || callData.success || callData.evaluation);
      } else {
        console.log(`No success evaluation found for call ${callId}`);
      }
      
      return callData;
    } catch (error) {
      console.error(`Error fetching call details for ${callId}:`, error);
      return null;
    }
  }

  /**
   * Enhances call logs with customer data and additional details
   */
  static async enhanceCallsWithCustomerData(calls: any[], apiKey: string) {
    if (!calls || calls.length === 0) {
      return [];
    }
    
    console.log(`Enhancing ${calls.length} calls with customer data`);
    
    // Process in smaller batches to avoid overwhelming the API
    const batchSize = 5;
    const enhancedCalls = [];
    
    for (let i = 0; i < calls.length; i += batchSize) {
      const batch = calls.slice(i, i + batchSize);
      
      // Process each call in the batch concurrently
      const batchPromises = batch.map(async (call) => {
        try {
          // Only fetch details if the call has an ID and is missing success_evaluation
          if (call.id && (call.success_evaluation === undefined || call.success_evaluation === null)) {
            const detailedCall = await this.fetchCallDetails(apiKey, call.id);
            
            if (detailedCall) {
              // Update the call with the detailed information
              call.success_evaluation = detailedCall.success_evaluation || detailedCall.success || detailedCall.evaluation || null;
              
              // Copy other fields that might be present in the detailed call but not in the original
              if (call.transcript === undefined && detailedCall.transcript) {
                call.transcript = detailedCall.transcript;
              }
              
              if (call.recording_url === undefined && detailedCall.recording_url) {
                call.recording_url = detailedCall.recording_url;
              }
              
              if (call.ended_reason === undefined && detailedCall.ended_reason) {
                call.ended_reason = detailedCall.ended_reason;
              }
            }
          }
          
          // Ensure all calls have consistent field structure
          return {
            ...call,
            success_evaluation: call.success_evaluation || call.success || call.evaluation || null
          };
        } catch (error) {
          console.error(`Error enhancing call ${call.id}:`, error);
          return call;
        }
      });
      
      const processedBatch = await Promise.all(batchPromises);
      enhancedCalls.push(...processedBatch);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < calls.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return enhancedCalls;
  }
}
