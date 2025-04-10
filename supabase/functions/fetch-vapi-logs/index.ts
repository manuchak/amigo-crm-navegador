import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Define CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Configuration for VAPI integration
 */
const CONFIG = {
  DEFAULT_API_KEY: '4e1d9a9c-de28-4e68-926c-3b5ca5a3ecb9',
  VAPI_ASSISTANT_ID: '0b7c2a96-0360-4fef-9956-e847fd696ea2',
  API_ENDPOINTS: [
    {
      url: 'https://api.vapi.ai/call/logs',
      method: 'GET',
      description: 'New VAPI call logs endpoint',
      supportsDates: false
    },
    {
      url: 'https://api.vapi.ai/call',
      method: 'GET',
      description: 'Primary calls endpoint',
      supportsDates: false
    },
    {
      url: 'https://api.vapi.ai/calls',
      method: 'GET',
      description: 'Alternative calls endpoint',
      supportsDates: false
    },
    {
      url: 'https://api.vapi.ai/call-logs',
      method: 'GET',
      description: 'Call logs endpoint',
      supportsDates: false
    },
    {
      url: 'https://api.vapi.ai/phone-number',
      method: 'GET',
      description: 'Phone numbers endpoint',
      supportsDates: false
    }
  ],
  // Mapping configuration to match VAPI API fields to Supabase columns
  FIELD_MAPPING: {
    // Standard VAPI API fields based on their documentation
    customerNumber: 'customer_number', 
    callerNumber: 'caller_phone_number',
    phoneNumber: 'phone_number',
    number: 'phone_number',
    duration: 'duration',
    // Other possible field variations from VAPI API
    customer_phone_number: 'customer_number',
    caller_phone: 'caller_phone_number',
    to_number: 'customer_number',
    from_number: 'caller_phone_number',
    // Additional field mappings for customer numbers
    to: 'customer_number',
    recipient: 'customer_number',
    receiverNumber: 'customer_number',
    receiver: 'customer_number',
    toNumber: 'customer_number',
    recipientNumber: 'customer_number',
    // Phone number field from the documentation
    fallbackDestination: {
      number: 'customer_number'
    }
  },
  // Metadata fields to request explicitly when calling VAPI API
  METADATA_REQUEST_FIELDS: [
    'phoneNumber',
    'customerNumber',
    'callerNumber',
    'customerPhoneNumber',
    'recipientNumber',
    'toNumber',
    'number'
  ]
};

/**
 * Creates a Supabase client
 */
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

/**
 * API Key Management Module
 */
class ApiKeyManager {
  /**
   * Fetch the VAPI API key from the database
   */
  static async getApiKey(supabase) {
    console.log('Fetching VAPI API key from database')
    try {
      const { data: secretData, error: secretError } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'VAPI_API_KEY')
        .maybeSingle()
      
      if (secretError) {
        console.error('Error fetching VAPI API key from database:', secretError)
        throw new Error('Failed to fetch API key from database')
      }
      
      // If API key is not found in database, use the default one
      let apiKey = secretData?.value
      
      if (!apiKey) {
        console.log('VAPI API key not found in database, using default key')
        apiKey = CONFIG.DEFAULT_API_KEY
        
        // Try to store the default key in the database for future use
        try {
          await supabase.from('secrets').insert([
            { name: 'VAPI_API_KEY', value: apiKey }
          ])
          console.log('Default VAPI API key stored in database')
        } catch (storeError) {
          // Continue even if storing fails
          console.error('Failed to store default VAPI API key:', storeError)
        }
      }

      return apiKey
    } catch (error) {
      console.error('Error in getApiKey:', error)
      // Fall back to default key on error
      return CONFIG.DEFAULT_API_KEY
    }
  }
}

/**
 * Date Range Helper
 */
class DateRangeHelper {
  /**
   * Get start and end dates for fetching logs
   */
  static getDateRange(requestParams = {}) {
    try {
      const now = new Date()
      const startDate = requestParams.start_date ? 
        new Date(requestParams.start_date) : 
        new Date(now.setDate(now.getDate() - 30))
      const endDate = requestParams.end_date ?
        new Date(requestParams.end_date) :
        new Date()
        
      const startDateISO = startDate.toISOString()
      const endDateISO = endDate.toISOString()

      console.log(`Fetching VAPI logs from ${startDateISO} to ${endDateISO}`)
      
      return { startDateISO, endDateISO }
    } catch (error) {
      console.error('Error parsing date range:', error)
      const now = new Date()
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
      return {
        startDateISO: thirtyDaysAgo.toISOString(),
        endDateISO: new Date().toISOString()
      }
    }
  }
}

/**
 * VAPI API Client
 */
class VapiApiClient {
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

/**
 * Response Parser
 */
class ResponseParser {
  /**
   * Extract logs from various response formats
   */
  static extractLogsFromResponse(data) {
    if (!data) {
      console.log('No data received from VAPI API')
      return []
    }
    
    // Log the exact structure received to help diagnose format
    console.log("Response data type:", typeof data)
    console.log("Response has data property:", "data" in data)
    console.log("Response has calls property:", "calls" in data)
    console.log("Response is array:", Array.isArray(data))
    
    // Additional logging for deeper nested properties
    if (typeof data === 'object' && data !== null) {
      if (data.data) console.log("data.data type:", typeof data.data, "is array:", Array.isArray(data.data))
      if (data.calls) console.log("data.calls type:", typeof data.calls, "is array:", Array.isArray(data.calls))
      if (data.results) console.log("data.results type:", typeof data.results, "is array:", Array.isArray(data.results))
      
      // Check for phone number and duration fields specifically
      const sampleObject = this.getSampleObject(data);
      if (sampleObject) {
        console.log("Sample object properties:", Object.keys(sampleObject))
        console.log("Phone number fields:", this.findPhoneNumberFields(sampleObject))
        console.log("Duration field:", sampleObject.duration, "type:", typeof sampleObject.duration)
        
        // Additional detailed logging about field names to help debug
        console.log("All fields in sample object:", Object.entries(sampleObject)
          .map(([key, value]) => `${key}: ${typeof value} = ${JSON.stringify(value)}`)
          .join(', '))
      }
    }
    
    let logs = []
    
    // Try different response formats
    if (Array.isArray(data)) {
      logs = data
      console.log(`Retrieved ${logs.length} logs from VAPI API (array format)`)
    } else if (data && Array.isArray(data.data)) {
      logs = data.data
      console.log(`Retrieved ${logs.length} logs from VAPI API (data format)`)
    } else if (data && Array.isArray(data.calls)) {
      logs = data.calls
      console.log(`Retrieved ${logs.length} logs from VAPI API (calls format)`)
    } else if (data && data.results && Array.isArray(data.results)) {
      logs = data.results
      console.log(`Retrieved ${logs.length} logs from VAPI API (results format)`)
    } else if (data && typeof data === 'object' && data.metadata && Array.isArray(data.metadata.calls)) {
      logs = data.metadata.calls
      console.log(`Retrieved ${logs.length} logs from VAPI API (metadata.calls format)`)
    } else if (data && data.data && typeof data.data === 'object' && Array.isArray(data.data.records)) {
      logs = data.data.records
      console.log(`Retrieved ${logs.length} logs from VAPI API (data.records format)`)
    } else if (data && data.records && Array.isArray(data.records)) {
      logs = data.records
      console.log(`Retrieved ${logs.length} logs from VAPI API (records format)`)
    } else if (data && data.items && Array.isArray(data.items)) {
      logs = data.items
      console.log(`Retrieved ${logs.length} logs from VAPI API (items format)`)
    } else {
      // If no recognized format is found, log the structure for debugging
      console.log('Response data structure:', JSON.stringify(data).substring(0, 300))
      console.log('No logs found in VAPI API response or unexpected format')
    }

    // Log details of first item if available
    if (logs && logs.length > 0) {
      console.log('Sample log item:', JSON.stringify(logs[0]).substring(0, 300))
      
      // Detailed phone number field inspection of first log
      const phoneFields = this.inspectPhoneNumberFields(logs[0]);
      console.log('Phone number fields in first log:', phoneFields);
    }

    return logs || []
  }

  /**
   * Extract a sample object from any of the possible data structures
   */
  static getSampleObject(data) {
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    if (data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data[0];
    }
    if (data && Array.isArray(data.calls) && data.calls.length > 0) {
      return data.calls[0];
    }
    if (data && Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  }

  /**
   * Find all potential phone number fields in an object
   */
  static findPhoneNumberFields(obj) {
    if (!obj || typeof obj !== 'object') return [];
    
    const phoneFields = [];
    for (const [key, value] of Object.entries(obj)) {
      if (
        typeof value === 'string' && 
        (key.toLowerCase().includes('phone') || 
         key.toLowerCase().includes('caller') ||
         key.toLowerCase().includes('customer') ||
         key.toLowerCase().includes('recipient') ||
         key.toLowerCase().includes('number') ||
         key === 'to' ||
         key === 'from')
      ) {
        phoneFields.push({ key, value });
      }
    }
    return phoneFields;
  }
  
  /**
   * Inspect and log all phone number related fields in a log entry
   */
  static inspectPhoneNumberFields(log) {
    if (!log || typeof log !== 'object') {
      return { error: 'Invalid log entry' };
    }
    
    // Collect all fields that might contain phone numbers
    const phoneFields = {};
    const possibleKeys = [
      'phone_number', 'phoneNumber', 'caller_number', 'callerNumber',
      'caller_phone_number', 'callerPhoneNumber', 'customer_number', 'customerNumber',
      'customer_phone', 'customerPhone', 'from', 'to', 'toPhoneNumber', 'to_phone_number',
      'phone', 'number', 'fromNumber', 'from_number', 'recipientPhone', 'recipientNumber',
      'recipient', 'toNumber', 'receiver', 'receiverNumber'
    ];
    
    // Check each possible key
    for (const key of possibleKeys) {
      if (key in log && log[key]) {
        phoneFields[key] = log[key];
      }
    }
    
    // Check nested objects - first in metadata
    if (log.metadata && typeof log.metadata === 'object') {
      for (const key of possibleKeys) {
        if (key in log.metadata && log.metadata[key]) {
          phoneFields[`metadata.${key}`] = log.metadata[key];
        }
      }
      
      // Special case for explicitly requested phone number metadata
      CONFIG.METADATA_REQUEST_FIELDS.forEach(field => {
        if (log.metadata[field]) {
          phoneFields[`metadata.${field}`] = log.metadata[field];
        }
      });
    }
    
    // Also check for non-standard field names that might contain phone numbers
    for (const [key, value] of Object.entries(log)) {
      if (
        typeof value === 'string' && 
        !phoneFields[key] &&
        (key.toLowerCase().includes('phone') || 
         key.toLowerCase().includes('number') ||
         key.toLowerCase().includes('caller') ||
         key.toLowerCase().includes('customer') ||
         key.toLowerCase().includes('recipient'))
      ) {
        phoneFields[key] = value;
      }
    }
    
    return phoneFields;
  }
  
  /**
   * Attempt to find the most appropriate value for a specific field
   */
  static findFieldValue(log, fieldType) {
    // Use our field mapping to check all possible field variations
    const possibleFieldNames = Object.keys(CONFIG.FIELD_MAPPING)
      .filter(key => CONFIG.FIELD_MAPPING[key] === fieldType);
    
    // Try standard field names first
    for (const fieldName of possibleFieldNames) {
      if (log[fieldName] !== undefined && log[fieldName] !== null) {
        return log[fieldName];
      }
    }
    
    // Try camelCase and snake_case variations
    const fieldNameVariations = [];
    for (const fieldName of possibleFieldNames) {
      // Add camelCase variation
      fieldNameVariations.push(fieldName.replace(/(_\w)/g, m => m[1].toUpperCase()));
      // Add snake_case variation
      fieldNameVariations.push(fieldName.replace(/([A-Z])/g, m => `_${m.toLowerCase()}`));
    }
    
    for (const fieldName of fieldNameVariations) {
      if (log[fieldName] !== undefined && log[fieldName] !== null) {
        return log[fieldName];
      }
    }
    
    // Try metadata if available
    if (log.metadata && typeof log.metadata === 'object') {
      // First check standard field names in metadata
      for (const fieldName of [...possibleFieldNames, ...fieldNameVariations]) {
        if (log.metadata[fieldName] !== undefined && log.metadata[fieldName] !== null) {
          return log.metadata[fieldName];
        }
      }
      
      // Then check explicit metadata request fields
      if (fieldType === 'customer_number') {
        for (const requestField of ['customerNumber', 'customerPhoneNumber', 'recipientNumber', 'toNumber']) {
          if (log.metadata[requestField]) {
            return log.metadata[requestField];
          }
        }
      }
    }
    
    // Return null if not found
    return null;
  }
}

/**
 * Database Operations
 */
class DatabaseManager {
  /**
   * Process and store logs in the database
   */
  static async processAndStoreLogs(supabase, logs) {
    let insertedCount = 0
    let updatedCount = 0
    let errorCount = 0

    if (!logs || logs.length === 0) {
      return { insertedCount, updatedCount, errorCount }
    }

    console.log(`Processing ${logs.length} logs from VAPI API`)

    for (const log of logs) {
      try {
        // Skip if log doesn't have an ID
        if (!log.id) {
          console.log('Skipping log without ID:', log)
          errorCount++
          continue
        }
        
        // Check if log already exists in the database
        const { data: existingLog, error: checkError } = await supabase
          .from('vapi_call_logs')
          .select('id')
          .eq('log_id', log.id)
          .maybeSingle()

        if (checkError) {
          console.error(`Error checking if log ${log.id} exists:`, checkError)
          errorCount++
          continue
        }

        // Prepare the log data with fallbacks for missing fields
        const logData = this.normalizeLogData(log)
        
        // Enhanced debug info for phone number and duration
        console.log(`Log ${log.id} - Phone data:`)
        console.log(`  - customer=${logData.customer_number}, type=${typeof logData.customer_number}`)
        console.log(`  - caller=${logData.caller_phone_number}, type=${typeof logData.caller_phone_number}`)
        console.log(`  - phone=${logData.phone_number}, type=${typeof logData.phone_number}`)
        console.log(`Log ${log.id} - Duration: ${logData.duration}, type=${typeof logData.duration}`)

        // Insert or update the log
        if (!existingLog) {
          // Insert new log
          const { error: insertError } = await supabase
            .from('vapi_call_logs')
            .insert([logData])

          if (insertError) {
            console.error(`Error inserting log ${log.id}:`, insertError)
            errorCount++
          } else {
            insertedCount++
          }
        } else {
          // Update existing log
          const { error: updateError } = await supabase
            .from('vapi_call_logs')
            .update(logData)
            .eq('log_id', log.id)

          if (updateError) {
            console.error(`Error updating log ${log.id}:`, updateError)
            errorCount++
          } else {
            updatedCount++
          }
        }
      } catch (err) {
        console.error(`Error processing log ${log?.id || 'unknown'}:`, err)
        errorCount++
      }
    }

    return { insertedCount, updatedCount, errorCount }
  }
  
  /**
   * Normalize log data to match database schema
   */
  static normalizeLogData(log) {
    // Handle duration specially to ensure it's parsed as a number
    let duration = null;
    if (log.duration !== undefined) {
      // Try to convert to number if it's a string
      if (typeof log.duration === 'string') {
        duration = parseInt(log.duration, 10);
        // Check if valid number after parsing
        if (isNaN(duration)) duration = 0;
      } else if (typeof log.duration === 'number') {
        duration = log.duration;
      } else {
        // Default to 0 instead of null for duration
        duration = 0;
      }
    } else {
      // Try to find duration in alternative fields
      const durationFields = ['length', 'call_duration', 'callDuration', 'time_length', 'timeLength'];
      for (const field of durationFields) {
        if (log[field] !== undefined && log[field] !== null) {
          const parsedDuration = typeof log[field] === 'string' ? 
            parseInt(log[field], 10) : log[field];
          if (!isNaN(parsedDuration)) {
            duration = parsedDuration;
            break;
          }
        }
      }
      
      // Default to 0 if no valid duration found
      if (duration === null) duration = 0;
    }
    
    // Enhanced phone number extraction
    // Get phone number from the structured VAPI format
    let phoneNumber = null;
    let customerNumber = null;
    let callerNumber = null;
    
    // First try to extract from the fallbackDestination structure
    if (log.metadata && log.metadata.fallbackDestination && log.metadata.fallbackDestination.number) {
      phoneNumber = String(log.metadata.fallbackDestination.number).trim();
    }
    
    // Check for the number field from the phone number object
    if (!phoneNumber && log.number && typeof log.number === 'string') {
      phoneNumber = String(log.number).trim();
    }
    
    if (!phoneNumber && log.metadata && log.metadata.number && typeof log.metadata.number === 'string') {
      phoneNumber = String(log.metadata.number).trim();
    }
    
    // Look for customer number in various possible fields
    const customerFields = [
      'customer_number', 'customerNumber', 'to', 'toNumber', 
      'recipient', 'recipientNumber', 'destination'
    ];
    
    for (const field of customerFields) {
      if (log[field] !== undefined && log[field] !== null) {
        customerNumber = String(log[field]).trim();
        break;
      }
    }
    
    // Check metadata if no number found in direct fields
    if (!customerNumber && log.metadata && typeof log.metadata === 'object') {
      for (const field of customerFields) {
        if (log.metadata[field] !== undefined && log.metadata[field] !== null) {
          customerNumber = String(log.metadata[field]).trim();
          break;
        }
      }
    }
    
    // Similarly extract caller number
    const callerFields = [
      'caller_phone_number', 'callerPhoneNumber', 'callerNumber',
      'from', 'fromNumber', 'caller', 'source'
    ];
    
    for (const field of callerFields) {
      if (log[field] !== undefined && log[field] !== null) {
        callerNumber = String(log[field]).trim();
        break;
      }
    }
    
    // Check metadata for caller number
    if (!callerNumber && log.metadata && typeof log.metadata === 'object') {
      for (const field of callerFields) {
        if (log.metadata[field] !== undefined && log.metadata[field] !== null) {
          callerNumber = String(log.metadata[field]).trim();
          break;
        }
      }
    }
    
    // If no specific numbers are found, use the general phone number as fallback
    if (!phoneNumber) {
      const phoneFields = ['phone_number', 'phoneNumber', 'phone', 'number'];
      
      for (const field of phoneFields) {
        if (log[field] !== undefined && log[field] !== null) {
          phoneNumber = String(log[field]).trim();
          break;
        }
      }
      
      // Check metadata for phone number
      if (!phoneNumber && log.metadata && typeof log.metadata === 'object') {
        for (const field of phoneFields) {
          if (log.metadata[field] !== undefined && log.metadata[field] !== null) {
            phoneNumber = String(log.metadata[field]).trim();
            break;
          }
        }
        
        // Special check for enhanced phone from our processing
        if (!phoneNumber && log.metadata.enhanced_phone) {
          phoneNumber = String(log.metadata.enhanced_phone).trim();
        }
      }
    }
    
    // Ensure we have some phone number data by using cross-fallbacks
    if (!customerNumber && !callerNumber && phoneNumber) {
      // If we only have phone_number but no specific roles, assign based on call direction
      if (log.direction === 'inbound') {
        callerNumber = phoneNumber;
      } else {
        customerNumber = phoneNumber;
      }
    } else if (!phoneNumber) {
      // If we have caller or customer but no general phone, use one of those
      phoneNumber = customerNumber || callerNumber;
    }

    // Log all extracted phone numbers for debugging
    console.log(`Extracted numbers for log ${log.id}:`);
    console.log(`- phone: ${phoneNumber || 'Not found'}`);
    console.log(`- caller: ${callerNumber || 'Not found'}`);
    console.log(`- customer: ${customerNumber || 'Not found'}`);

    return {
      log_id: log.id,
      assistant_id: log.assistant_id || log.assistantId || CONFIG.VAPI_ASSISTANT_ID,
      organization_id: log.organization_id || log.organizationId || 'unknown',
      conversation_id: log.conversation_id || log.conversationId || null,
      phone_number: phoneNumber || null,
      caller_phone_number: callerNumber || null,
      customer_number: customerNumber || null,
      start_time: log.start_time || log.startTime || log.startedAt || log.time_start || log.created_at || null,
      end_time: log.end_time || log.endTime || log.endedAt || log.time_end || null,
      duration: duration,
      status: log.status || null,
      direction: log.direction || log.type || null,
      transcript: log.transcript || null,
      recording_url: log.recording_url || log.recordingUrl || log.recording || null,
      metadata: log.metadata || {},
      
      // Fields with better fallbacks
      assistant_name: log.assistant_name || log.assistantName || null,
      assistant_phone_number: log.assistant_phone_number || log.assistantPhoneNumber || phoneNumber || null,
      call_type: log.call_type || log.callType || log.type || null,
      cost: typeof log.cost === 'number' ? log.cost : null,
      ended_reason: log.ended_reason || log.endedReason || log.ended_reason_detail || log.endedReasonDetail || null,
      success_evaluation: log.success_evaluation || log.successEvaluation || null
    }
  }
}

/**
 * Main handler for edge function
 */
async function handleRequest(req) {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient()
    
    // Get request body for additional parameters
    let requestParams = {}
    if (req.method === 'POST') {
      try {
        requestParams = await req.json()
      } catch (e) {
        console.error('Failed to parse request body:', e)
      }
    }
    
    // Get the VAPI API key
    const apiKey = await ApiKeyManager.getApiKey(supabase)
    
    // Get date range for the query
    const { startDateISO, endDateISO } = DateRangeHelper.getDateRange(requestParams)
    
    // Fetch logs from VAPI API
    const logs = await VapiApiClient.fetchLogs(apiKey, startDateISO, endDateISO)
    
    // Process and store logs in the database
    const { insertedCount, updatedCount, errorCount } = await DatabaseManager.processAndStoreLogs(supabase, logs)

    // Return success with counts
    return new Response(
      JSON.stringify({
        success: true,
        message: `VAPI logs processed: ${insertedCount} inserted, ${updatedCount} updated, ${errorCount} errors`,
        total_logs: logs?.length || 0,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorCount
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Error in fetch-vapi-logs function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        error: String(error)
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
}

// This is the Deno Deploy entry point
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  return handleRequest(req);
});
