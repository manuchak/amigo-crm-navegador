
/**
 * Utilities for extracting data from webhook payloads
 */

/**
 * Extract call ID from various webhook payload structures
 */
export function extractCallId(data: any): string | null {
  // Check direct call_id fields
  if (data.call_id) return data.call_id;
  if (data.id) return data.id;
  if (data.log_id) return data.log_id;

  // Check nested structures
  if (data.call && data.call.id) return data.call.id;
  if (data.call && data.call.call_id) return data.call.call_id;
  if (data.call && data.call.log_id) return data.call.log_id;
  
  // Check metadata
  if (data.metadata && data.metadata.call_id) return data.metadata.call_id;
  
  // Check event object
  if (data.event && data.event.call_id) return data.event.call_id;
  if (data.event && data.event.id) return data.event.id;
  
  return null;
}

/**
 * Extract phone number from various webhook payload structures
 */
export function extractPhoneNumber(data: any): string | null {
  // Check direct phone fields
  if (data.phone_number) return data.phone_number;
  if (data.caller_phone_number) return data.caller_phone_number;
  if (data.customer_number) return data.customer_number;
  if (data.telefono) return data.telefono;
  
  // Check nested structures
  if (data.call && data.call.phone_number) return data.call.phone_number;
  if (data.call && data.call.customer_number) return data.call.customer_number;
  if (data.caller && data.caller.phone_number) return data.caller.phone_number;
  if (data.customer && data.customer.phone_number) return data.customer.phone_number;
  
  // Check metadata for phone numbers
  if (data.metadata && data.metadata.phone_number) return data.metadata.phone_number;
  if (data.metadata && data.metadata.caller_phone_number) return data.metadata.caller_phone_number;
  if (data.metadata && data.metadata.customer_number) return data.metadata.customer_number;
  
  // Check inside the event object
  if (data.event && data.event.phone_number) return data.event.phone_number;
  
  // No suitable phone number found
  return null;
}
