
/**
 * Normalize log data from various VAPI API endpoints into a consistent structure
 */
export function normalizeLogData(log: any): any {
  // Create a consistent data structure regardless of API source
  const logData: any = {
    log_id: log.id || log.call_id || null,
    assistant_id: log.assistant_id || null,
    organization_id: log.organization_id || null,
    conversation_id: log.conversation_id || null,
    customer_number: log.customer_number || log.to || null,
    caller_phone_number: log.caller_phone_number || log.from || null,
    phone_number: log.phone_number || null,
    start_time: log.start_time || log.created_at || null,
    end_time: log.end_time || null,
    duration: log.duration || null,
    status: log.status || null,
    direction: log.direction || null,
    call_type: log.call_type || null,
    transcript: (log.transcript && typeof log.transcript === 'object') ? log.transcript : null,
    recording_url: log.recording_url || null,
    ended_reason: log.ended_reason || null,
    assistant_name: log.assistant_name || null,
    assistant_phone_number: log.assistant_phone_number || null,
    cost: log.cost || null,
    metadata: log,
    success_evaluation: log.success_evaluation || log.success || log.evaluation || null
  };

  // Ensure we have the ended_reason field populated for filtering
  if (!logData.ended_reason && log.metadata && log.metadata.ended_reason) {
    logData.ended_reason = log.metadata.ended_reason;
  }

  // Console log for debugging success_evaluation
  console.log(`Log ${logData.log_id} success_evaluation:`, {
    raw_success: log.success_evaluation,
    raw_success_alt: log.success,
    raw_evaluation: log.evaluation,
    normalized: logData.success_evaluation,
    has_metadata_success: log.metadata && (log.metadata.success_evaluation || log.metadata.success || log.metadata.evaluation)
  });

  // Try to extract success_evaluation from metadata if it's nested there
  if (!logData.success_evaluation && log.metadata) {
    logData.success_evaluation = log.metadata.success_evaluation || log.metadata.success || log.metadata.evaluation || null;
  }

  // For better logging, convert the phone data to strings if needed
  if (logData.customer_number !== null && typeof logData.customer_number !== 'string') {
    logData.customer_number = String(logData.customer_number);
  }
  
  if (logData.caller_phone_number !== null && typeof logData.caller_phone_number !== 'string') {
    logData.caller_phone_number = String(logData.caller_phone_number);
  }
  
  if (logData.phone_number !== null && typeof logData.phone_number !== 'string') {
    logData.phone_number = String(logData.phone_number);
  }

  return logData;
}
