
import { ResponseParser } from './responseParser.ts';

/**
 * Database Operations
 */
export class DatabaseManager {
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
