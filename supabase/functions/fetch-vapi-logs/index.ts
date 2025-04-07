
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
      url: 'https://api.vapi.ai/call',
      method: 'GET',
      description: 'Primary calls endpoint'
    },
    {
      url: 'https://api.vapi.ai/calls',
      method: 'GET',
      description: 'Alternative calls endpoint'
    },
    {
      url: 'https://api.vapi.ai/call-logs',
      method: 'GET',
      description: 'Call logs endpoint'
    },
    {
      url: 'https://api.vapi.ai/analytics/call',
      method: 'GET',
      description: 'Analytics endpoint'
    }
  ]
}

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
    const params = new URLSearchParams({
      assistantId: CONFIG.VAPI_ASSISTANT_ID,
      limit: '100'
    })
    
    // Add date range if supported by endpoint
    if (endpointConfig.supportsDates) {
      params.append('startTime', startDate)
      params.append('endTime', endDate)
    }
    
    return params.toString()
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
        supportsDates: endpoint.url.includes('analytics')
      }
    })
  }
  
  /**
   * Try API discovery as a last resort
   */
  static async tryApiDiscovery(apiKey) {
    try {
      console.log("Trying API discovery endpoint")
      const apiUrl = 'https://api.vapi.ai/api'
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        return null
      }
      
      const apiDoc = await response.json()
      console.log("API discovery data:", JSON.stringify(apiDoc).substring(0, 200) + '...')
      
      // If we find a specific endpoint in the API documentation, try it
      if (apiDoc && apiDoc.paths) {
        const callEndpoint = Object.keys(apiDoc.paths).find(path => 
          path.includes("/call") || path.includes("/calls")
        )
        
        if (callEndpoint) {
          const fullUrl = `https://api.vapi.ai${callEndpoint}?assistantId=${CONFIG.VAPI_ASSISTANT_ID}&limit=100`
          console.log(`Trying discovered endpoint: ${fullUrl}`)
          
          const callResponse = await fetch(fullUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            }
          })
          
          if (callResponse.ok) {
            return await callResponse.json()
          }
        }
      }
      
      return null
    } catch (error) {
      console.error("Error with API discovery:", error)
      return null
    }
  }
  
  /**
   * Fetch logs from VAPI API trying multiple endpoints
   */
  static async fetchLogs(apiKey, startDate, endDate) {
    const endpoints = this.getEndpointConfigs()
    let lastError = null
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying VAPI endpoint: ${endpoint.url} with ${endpoint.method} method`)
        
        const params = this.formatParams(endpoint, startDate, endDate)
        const requestUrl = `${endpoint.url}?${params}`
        console.log(`Full GET URL: ${requestUrl}`)
        
        const response = await fetch(requestUrl, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`VAPI API error response (${endpoint.url}): ${response.status}`, errorText)
          lastError = new Error(`VAPI API returned ${response.status}: ${errorText}`)
          continue
        }
        
        const data = await response.json()
        console.log(`Success with ${endpoint.url}! Response:`, JSON.stringify(data).substring(0, 200) + '...')
        
        return ResponseParser.extractLogsFromResponse(data)
      } catch (error) {
        console.error(`Error with ${endpoint.url}:`, error)
        lastError = error
      }
    }
    
    // Try API discovery as a last resort
    const discoveryData = await this.tryApiDiscovery(apiKey)
    if (discoveryData) {
      return ResponseParser.extractLogsFromResponse(discoveryData)
    }
    
    // If all attempts failed, throw the last error
    if (lastError) {
      throw lastError
    }
    
    throw new Error("All VAPI API endpoints failed")
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
         key.toLowerCase().includes('number'))
      ) {
        phoneFields.push({ key, value });
      }
    }
    return phoneFields;
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
        
        // Extra debug info for phone number and duration
        console.log(`Log ${log.id} - Phone data: customer=${logData.customer_number}, caller=${logData.caller_phone_number}`)
        console.log(`Log ${log.id} - Duration: ${logData.duration}, original type: ${typeof log.duration}`)

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
    if (log.duration !== undefined && log.duration !== null) {
      // Try to convert to number if it's a string
      if (typeof log.duration === 'string') {
        duration = parseInt(log.duration, 10);
        // Check if valid number after parsing
        if (isNaN(duration)) duration = null;
      } else if (typeof log.duration === 'number') {
        duration = log.duration;
      }
    }
    
    // Enhanced phone number extraction
    const callerNumber = log.caller_phone_number || 
                         log.callerPhoneNumber || 
                         log.customer_phone || 
                         log.customerPhoneNumber || 
                         log.from || null;
                         
    const customerNumber = log.customer_number || 
                           log.customerNumber || 
                           callerNumber || null;

    return {
      log_id: log.id,
      assistant_id: log.assistant_id || log.assistantId || CONFIG.VAPI_ASSISTANT_ID,
      organization_id: log.organization_id || log.organizationId || 'unknown',
      conversation_id: log.conversation_id || log.conversationId || null,
      phone_number: log.phone_number || log.phoneNumber || null,
      caller_phone_number: callerNumber,
      start_time: log.start_time || log.startTime || log.startedAt || null,
      end_time: log.end_time || log.endTime || log.endedAt || null,
      duration: duration,
      status: log.status || null,
      direction: log.direction || null,
      transcript: log.transcript || null,
      recording_url: log.recording_url || log.recordingUrl || null,
      metadata: log.metadata || {},
      
      // New fields
      assistant_name: log.assistant_name || log.assistantName || null,
      assistant_phone_number: log.assistant_phone_number || log.assistantPhoneNumber || log.phoneNumber || null,
      customer_number: customerNumber,
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

// Main handler for the Deno server
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  return handleRequest(req)
})
