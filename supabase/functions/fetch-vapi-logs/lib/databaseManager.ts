
import { CONFIG } from './config.ts';
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
    // FIXED: Calculate duration from startedAt and endedAt if available
    let duration = null;
    
    // First check for direct duration field (could be in seconds or milliseconds)
    if (log.duration !== undefined && log.duration !== null) {
      // Try to convert to number if it's a string
      if (typeof log.duration === 'string') {
        duration = parseInt(log.duration, 10);
        // Check if valid number after parsing
        if (isNaN(duration)) duration = null;
      } else if (typeof log.duration === 'number') {
        duration = log.duration;
      }
      
      // If duration seems to be in milliseconds (very large number), convert to seconds
      if (duration !== null && duration > 100000) {
        duration = Math.floor(duration / 1000);
        console.log(`Converted duration from milliseconds to seconds: ${duration}s`);
      }
    } 
    
    // If duration is still null, try to calculate from timestamps
    if (duration === null) {
      // Try various timestamp field names
      const startFields = ['start_time', 'startTime', 'startedAt', 'time_start', 'created_at'];
      const endFields = ['end_time', 'endTime', 'endedAt', 'time_end', 'updated_at'];
      
      let startTime = null;
      let endTime = null;
      
      // Find the first valid start time
      for (const field of startFields) {
        if (log[field] && typeof log[field] === 'string') {
          startTime = log[field];
          console.log(`Found start time in field ${field}: ${startTime}`);
          break;
        }
      }
      
      // Find the first valid end time
      for (const field of endFields) {
        if (log[field] && typeof log[field] === 'string') {
          endTime = log[field];
          console.log(`Found end time in field ${field}: ${endTime}`);
          break;
        }
      }
      
      // Calculate duration if we have both timestamps
      if (startTime && endTime) {
        try {
          const startDate = new Date(startTime);
          const endDate = new Date(endTime);
          
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            // Calculate duration in seconds
            duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
            console.log(`Calculated duration from timestamps: ${duration}s (${startTime} to ${endTime})`);
          }
        } catch (err) {
          console.error(`Error calculating duration from timestamps:`, err);
        }
      }
      
      // Try to find duration in alternative fields
      if (duration === null) {
        const durationFields = ['length', 'call_duration', 'callDuration', 'time_length', 'timeLength'];
        for (const field of durationFields) {
          if (log[field] !== undefined && log[field] !== null) {
            let fieldValue = log[field];
            const parsedDuration = typeof fieldValue === 'string' ? 
              parseInt(fieldValue, 10) : fieldValue;
              
            if (!isNaN(parsedDuration)) {
              // Check if the value seems like milliseconds (very large number)
              // and convert to seconds if needed
              if (parsedDuration > 100000) {
                duration = Math.floor(parsedDuration / 1000);
                console.log(`Converted ${field} from milliseconds to seconds: ${duration}s`);
              } else {
                duration = parsedDuration;
                console.log(`Using ${field} for duration: ${duration}s`);
              }
              break;
            }
          }
        }
      }
      
      // Check if duration might be in the metadata
      if (duration === null && log.metadata) {
        try {
          const metadataObj = typeof log.metadata === 'string' ? 
            JSON.parse(log.metadata) : log.metadata;
          
          // Look for duration in metadata
          if (metadataObj.duration) {
            const metaDuration = metadataObj.duration;
            duration = typeof metaDuration === 'string' ? 
              parseInt(metaDuration, 10) : metaDuration;
            
            // Check if it's in milliseconds
            if (duration > 100000) {
              duration = Math.floor(duration / 1000);
              console.log(`Converted metadata duration from milliseconds to seconds: ${duration}s`);
            }
          } else if (metadataObj.message && metadataObj.message.duration) {
            // Some implementations might have message duration
            const messageDuration = metadataObj.message.duration;
            duration = typeof messageDuration === 'string' ? 
              parseInt(messageDuration, 10) : messageDuration;
            
            // Check if it's in milliseconds
            if (duration > 100000) {
              duration = Math.floor(duration / 1000);
              console.log(`Converted message duration from milliseconds to seconds: ${duration}s`);
            }
          }
        } catch (err) {
          console.error('Error parsing metadata for duration:', err);
        }
      }
    }
    
    // Ensure duration is not null before sending to database
    // FIXED: Default to 0 only if nothing else worked
    if (duration === null) {
      console.log('No valid duration found, setting to 0');
      duration = 0;
    }
    
    // Extract customer number according to VAPI docs format
    let customerNumber = null;
    
    // First check for the customer object structure as documented by VAPI
    if (log.customer && log.customer.number) {
      customerNumber = log.customer.number;
      console.log(`Found customer.number in log: ${customerNumber}`);
    }
    
    // Check metadata for VAPI-specific customer number (that we might have added)
    if (!customerNumber && log.metadata && log.metadata.vapi_customer_number) {
      customerNumber = log.metadata.vapi_customer_number;
      console.log(`Found vapi_customer_number in metadata: ${customerNumber}`);
    }
    
    // If still no customer number, use the fallback extraction logic
    if (!customerNumber) {
      customerNumber = ResponseParser.findFieldValue(log, 'customer_number');
      if (customerNumber) {
        console.log(`Found customer number via ResponseParser: ${customerNumber}`);
      }
    }
    
    // Get other phone numbers for fallback
    const phoneNumber = ResponseParser.findFieldValue(log, 'phone_number');
    const callerNumber = ResponseParser.findFieldValue(log, 'caller_phone_number');
    
    // Ensure we have some phone number data by using cross-fallbacks
    let finalPhoneNumber = phoneNumber;
    let finalCallerNumber = callerNumber;
    let finalCustomerNumber = customerNumber;
    
    if (!finalCustomerNumber && !finalCallerNumber && finalPhoneNumber) {
      // If we only have phone_number but no specific roles, assign based on call direction
      if (log.direction === 'inbound') {
        finalCallerNumber = phoneNumber;
      } else {
        finalCustomerNumber = phoneNumber;
      }
    } else if (!finalPhoneNumber) {
      // If we have caller or customer but no general phone, use one of those
      finalPhoneNumber = finalCustomerNumber || finalCallerNumber;
    }

    // Log all extracted phone numbers for debugging
    console.log(`Extracted numbers for log ${log.id}:`);
    console.log(`- phone: ${finalPhoneNumber || 'Not found'}`);
    console.log(`- caller: ${finalCallerNumber || 'Not found'}`);
    console.log(`- customer: ${finalCustomerNumber || 'Not found'}`);
    console.log(`- final duration: ${duration} seconds`);

    return {
      log_id: log.id,
      assistant_id: log.assistant_id || log.assistantId || CONFIG.VAPI_ASSISTANT_ID,
      organization_id: log.organization_id || log.organizationId || 'unknown',
      conversation_id: log.conversation_id || log.conversationId || null,
      phone_number: finalPhoneNumber || null,
      caller_phone_number: finalCallerNumber || null,
      customer_number: finalCustomerNumber || null,
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
      assistant_phone_number: log.assistant_phone_number || log.assistantPhoneNumber || finalPhoneNumber || null,
      call_type: log.call_type || log.callType || log.type || null,
      cost: typeof log.cost === 'number' ? log.cost : null,
      ended_reason: log.ended_reason || log.endedReason || log.ended_reason_detail || log.endedReasonDetail || null,
      success_evaluation: log.success_evaluation || log.successEvaluation || null
    }
  }
}
