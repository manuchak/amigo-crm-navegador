
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Define CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to create a Supabase client
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
  return createClient(supabaseUrl, supabaseKey)
}

// Helper module for API key management
const vapiKeyManager = {
  // Fetch the VAPI API key from the database
  async getApiKey(supabase) {
    console.log('Fetching VAPI API key from database')
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
    let VAPI_API_KEY = secretData?.value
    
    if (!VAPI_API_KEY) {
      console.log('VAPI API key not found in database, using default key')
      // Use default API key as fallback
      VAPI_API_KEY = '4e1d9a9c-de28-4e68-926c-3b5ca5a3ecb9'
      
      // Try to store the default key in the database for future use
      try {
        await supabase.from('secrets').insert([
          { name: 'VAPI_API_KEY', value: VAPI_API_KEY }
        ])
        console.log('Default VAPI API key stored in database')
      } catch (storeError) {
        // Continue even if storing fails
        console.error('Failed to store default VAPI API key:', storeError)
      }
    }

    return VAPI_API_KEY
  }
}

// Helper module for date handling
const dateHelper = {
  // Determine date range for fetching logs
  getDateRange(requestParams = {}) {
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
  }
}

// VAPI API client module
const vapiApiClient = {
  // VAPI Assistant ID
  VAPI_ASSISTANT_ID: '0b7c2a96-0360-4fef-9956-e847fd696ea2',
  
  // Endpoint configurations to try
  getEndpointConfigs() {
    return [
      // Try directly calling /calls with GET first
      {
        url: 'https://api.vapi.ai/calls',
        method: 'GET',
        paramsFormatter: (startDate, endDate) => new URLSearchParams({
          assistant_id: this.VAPI_ASSISTANT_ID,
          start_time: startDate,
          end_time: endDate,
          limit: '100'
        }).toString()
      },
      // Try /call-logs with GET
      {
        url: 'https://api.vapi.ai/call-logs',
        method: 'GET',
        paramsFormatter: (startDate, endDate) => new URLSearchParams({
          assistant_id: this.VAPI_ASSISTANT_ID,
          from: startDate,
          to: endDate,
          limit: '100'
        }).toString()
      },
      // Try /analytics/calls with POST
      {
        url: 'https://api.vapi.ai/analytics/calls',
        method: 'POST',
        bodyFormatter: (startDate, endDate) => ({
          assistant_id: this.VAPI_ASSISTANT_ID,
          start_time: startDate,
          end_time: endDate,
          limit: 100
        })
      }
    ];
  },
  
  // Fetch logs from VAPI API trying multiple endpoints
  async fetchLogs(apiKey, startDate, endDate) {
    const endpoints = this.getEndpointConfigs();
    let lastError = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying VAPI endpoint: ${endpoint.url} with ${endpoint.method} method`);
        
        let requestUrl = endpoint.url;
        const headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };
        
        let requestOptions = {
          method: endpoint.method,
          headers
        };
        
        // For GET requests, add query params to URL
        if (endpoint.method === 'GET' && endpoint.paramsFormatter) {
          const params = endpoint.paramsFormatter(startDate, endDate);
          requestUrl = `${requestUrl}?${params}`;
          console.log(`Full GET URL: ${requestUrl}`);
        }
        
        // For POST requests, add body
        if (endpoint.method === 'POST' && endpoint.bodyFormatter) {
          const body = endpoint.bodyFormatter(startDate, endDate);
          requestOptions.body = JSON.stringify(body);
          console.log(`POST body:`, JSON.stringify(body));
        }
        
        console.log(`Making ${endpoint.method} request to ${requestUrl}`);
        const response = await fetch(requestUrl, requestOptions);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`VAPI API error response (${endpoint.url}): ${response.status}`, errorText);
          lastError = new Error(`VAPI API returned ${response.status}: ${errorText}`);
          // Continue to the next endpoint
          continue;
        }
        
        const data = await response.json();
        console.log(`Success with ${endpoint.url}! Response:`, JSON.stringify(data).substring(0, 200) + '...');
        
        return responseParser.extractLogsFromResponse(data);
      } catch (error) {
        console.error(`Error with ${endpoint.url}:`, error);
        lastError = error;
        // Continue to the next endpoint
      }
    }
    
    // Try fallback direct API request with /api/ prefix
    try {
      console.log("Trying fallback with direct API call to /api/calls");
      const response = await fetch(`https://api.vapi.ai/api/calls?assistant_id=${this.VAPI_ASSISTANT_ID}&page=1&page_size=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`VAPI API fallback error: ${response.status}`, errorText);
        lastError = new Error(`VAPI API fallback returned ${response.status}: ${errorText}`);
        throw lastError;
      }
      
      const data = await response.json();
      console.log(`Success with fallback! Response:`, JSON.stringify(data).substring(0, 200) + '...');
      
      return responseParser.extractLogsFromResponse(data);
    } catch (error) {
      console.error("Fallback attempt failed:", error);
    }
    
    // If we've tried all endpoints and none worked, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new Error("All VAPI API endpoints failed");
  }
}

// Response parser module
const responseParser = {
  // Extract logs from various response formats
  extractLogsFromResponse(data) {
    let logs = [];
    
    // Log the exact structure received to help diagnose format
    console.log("Response data type:", typeof data);
    console.log("Response has data property:", "data" in data);
    console.log("Response has calls property:", "calls" in data);
    console.log("Response is array:", Array.isArray(data));
    
    if (data && Array.isArray(data.calls)) {
      logs = data.calls;
      console.log(`Retrieved ${logs.length} logs from VAPI API (calls format)`);
    } else if (data && Array.isArray(data.data)) {
      logs = data.data;
      console.log(`Retrieved ${logs.length} logs from VAPI API (data format)`);
    } else if (data && Array.isArray(data)) {
      logs = data;
      console.log(`Retrieved ${logs.length} logs from VAPI API (array format)`);
    } else if (data && data.results && Array.isArray(data.results)) {
      logs = data.results;
      console.log(`Retrieved ${logs.length} logs from VAPI API (results format)`);
    } else if (data && typeof data === 'object' && data.metadata && Array.isArray(data.metadata.calls)) {
      logs = data.metadata.calls;
      console.log(`Retrieved ${logs.length} logs from VAPI API (metadata.calls format)`);
    } else if (data && data.data && typeof data.data === 'object' && Array.isArray(data.data.records)) {
      logs = data.data.records;
      console.log(`Retrieved ${logs.length} logs from VAPI API (data.records format)`);
    } else if (data && data.records && Array.isArray(data.records)) {
      logs = data.records;
      console.log(`Retrieved ${logs.length} logs from VAPI API (records format)`);
    } else {
      // If no recognized format is found, log the structure for debugging
      console.log('Response data structure:', JSON.stringify(data).substring(0, 300));
      console.log('No logs found in VAPI API response or unexpected format');
    }

    return logs;
  }
}

// Database operations module
const dbManager = {
  // Process and store logs in the database
  async processAndStoreLogs(supabase, logs) {
    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    if (!logs || logs.length === 0) {
      return { insertedCount, updatedCount, errorCount };
    }

    console.log(`Processing ${logs.length} logs from VAPI API`);

    for (const log of logs) {
      try {
        // Skip if log doesn't have an ID
        if (!log.id) {
          console.log('Skipping log without ID:', log);
          errorCount++;
          continue;
        }
        
        // Check if log already exists in the database
        const { data: existingLog, error: checkError } = await supabase
          .from('vapi_call_logs')
          .select('id')
          .eq('log_id', log.id)
          .maybeSingle();

        if (checkError) {
          console.error(`Error checking if log ${log.id} exists:`, checkError);
          errorCount++;
          continue;
        }

        // Prepare the log data with fallbacks for missing fields
        const logData = {
          log_id: log.id,
          assistant_id: log.assistant_id || log.assistantId || '0b7c2a96-0360-4fef-9956-e847fd696ea2',
          organization_id: log.organization_id || log.organizationId || 'unknown',
          conversation_id: log.conversation_id || log.conversationId || null,
          phone_number: log.phone_number || log.phoneNumber || null,
          caller_phone_number: log.caller_phone_number || log.callerPhoneNumber || null,
          start_time: log.start_time || log.startTime || null,
          end_time: log.end_time || log.endTime || null,
          duration: log.duration || null,
          status: log.status || null,
          direction: log.direction || null,
          transcript: log.transcript || null,
          recording_url: log.recording_url || log.recordingUrl || null,
          metadata: log.metadata || {}
        };

        // Insert or update the log
        if (!existingLog) {
          // Insert new log
          const { error: insertError } = await supabase
            .from('vapi_call_logs')
            .insert([logData]);

          if (insertError) {
            console.error(`Error inserting log ${log.id}:`, insertError);
            errorCount++;
          } else {
            insertedCount++;
          }
        } else {
          // Update existing log
          const { error: updateError } = await supabase
            .from('vapi_call_logs')
            .update(logData)
            .eq('log_id', log.id);

          if (updateError) {
            console.error(`Error updating log ${log.id}:`, updateError);
            errorCount++;
          } else {
            updatedCount++;
          }
        }
      } catch (err) {
        console.error(`Error processing log ${log?.id || 'unknown'}:`, err);
        errorCount++;
      }
    }

    return { insertedCount, updatedCount, errorCount };
  }
}

// Main handler function for the edge function
async function handleRequest(req) {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    // Get the VAPI API key
    const apiKey = await vapiKeyManager.getApiKey(supabase);
    
    // Get request body for additional parameters
    let requestParams = {};
    if (req.method === 'POST') {
      try {
        requestParams = await req.json();
      } catch (e) {
        // If parsing fails, proceed with default parameters
        console.error('Failed to parse request body:', e);
      }
    }
    
    // Get date range for the query
    const { startDateISO, endDateISO } = dateHelper.getDateRange(requestParams);
    
    // Fetch logs from VAPI API
    const logs = await vapiApiClient.fetchLogs(apiKey, startDateISO, endDateISO);
    
    // Process and store logs in the database
    const { insertedCount, updatedCount, errorCount } = await dbManager.processAndStoreLogs(supabase, logs);

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
    );
  } catch (error) {
    console.error('Error in fetch-vapi-logs function:', error);
    
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
    );
  }
}

// Main handler for the Deno server
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  return handleRequest(req);
});
