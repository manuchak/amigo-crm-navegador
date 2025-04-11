
import { ResponseParser } from '../responseParser.ts';
import { CONFIG } from '../config.ts';
import { calculateDurationFromTimestamps, normalizeDuration } from './durationUtils.ts';
import { extractCustomerNumber, findBestPhoneNumber } from './phoneUtils.ts';

/**
 * Normalize log data to match database schema
 */
export function normalizeLogData(log) {
  // Handle duration calculation
  let duration = null;
  
  // First check for direct duration field
  if (log.duration !== undefined && log.duration !== null) {
    duration = normalizeDuration(log.duration);
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
      duration = calculateDurationFromTimestamps(startTime, endTime);
    }
    
    // Try to find duration in alternative fields
    if (duration === null) {
      const durationFields = ['length', 'call_duration', 'callDuration', 'time_length', 'timeLength'];
      for (const field of durationFields) {
        if (log[field] !== undefined && log[field] !== null) {
          duration = normalizeDuration(log[field]);
          if (duration !== null) {
            console.log(`Using ${field} for duration: ${duration}s`);
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
          duration = normalizeDuration(metadataObj.duration);
        } else if (metadataObj.message && metadataObj.message.duration) {
          duration = normalizeDuration(metadataObj.message.duration);
        }
      } catch (err) {
        console.error('Error parsing metadata for duration:', err);
      }
    }
  }
  
  // Ensure duration is not null before sending to database
  // Default to 0 only if nothing else worked
  if (duration === null) {
    console.log('No valid duration found, setting to 0');
    duration = 0;
  }
  
  // Extract phone numbers
  const customerNumber = extractCustomerNumber(log);
  const phoneNumber = ResponseParser.findFieldValue(log, 'phone_number');
  const callerNumber = ResponseParser.findFieldValue(log, 'caller_phone_number');
  
  // Ensure we have some phone number data by using cross-fallbacks
  const finalCustomerNumber = customerNumber || 
    findBestPhoneNumber(log, customerNumber, callerNumber, phoneNumber);
  const finalCallerNumber = callerNumber || 
    (log.direction === 'inbound' ? phoneNumber : null);
  const finalPhoneNumber = phoneNumber || customerNumber || callerNumber;

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
  };
}
