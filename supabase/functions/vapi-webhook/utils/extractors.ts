
/**
 * Helper function to extract call ID from various payload structures
 */
export function extractCallId(data: any): string | null {
  // Check direct id fields
  if (data.call_id) return data.call_id;
  if (data.id) return data.id;
  
  // Check nested structures
  if (data.call && data.call.id) return data.call.id;
  if (data.call_data && data.call_data.id) return data.call_data.id;
  if (data.event && data.event.call_id) return data.event.call_id;
  if (data.event && data.event.id) return data.event.id;
  
  // Check for conversation_id as fallback
  if (data.conversation_id) return data.conversation_id;
  
  // No suitable ID found
  return null;
}

/**
 * Helper function to extract phone number from various payload structures
 */
export function extractPhoneNumber(data: any): string | null {
  // Check direct phone fields
  if (data.phone_number) return data.phone_number;
  if (data.caller_phone_number) return data.caller_phone_number;
  if (data.customer_number) return data.customer_number;
  
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

/**
 * Helper function to extract assistant ID from various payload structures
 */
export function extractAssistantId(data: any): string | null {
  // Check direct assistant fields
  if (data.assistant_id) return data.assistant_id;
  if (data.assistantId) return data.assistantId;
  
  // Check nested structures
  if (data.assistant && data.assistant.id) return data.assistant.id;
  if (data.call && data.call.assistant_id) return data.call.assistant_id;
  if (data.call && data.call.assistantId) return data.call.assistantId;
  
  // Check metadata for assistant ID
  if (data.metadata && data.metadata.assistant_id) return data.metadata.assistant_id;
  if (data.metadata && data.metadata.assistantId) return data.metadata.assistantId;
  
  // Check inside the event object
  if (data.event && data.event.assistant_id) return data.event.assistant_id;
  if (data.event && data.event.assistantId) return data.event.assistantId;
  
  // No suitable assistant ID found
  return null;
}

/**
 * Helper function to extract organization ID from various payload structures
 */
export function extractOrganizationId(data: any): string | null {
  // Check direct organization fields
  if (data.organization_id) return data.organization_id;
  if (data.organizationId) return data.organizationId;
  
  // Check nested structures
  if (data.organization && data.organization.id) return data.organization.id;
  if (data.call && data.call.organization_id) return data.call.organization_id;
  if (data.call && data.call.organizationId) return data.call.organizationId;
  
  // Check metadata for organization ID
  if (data.metadata && data.metadata.organization_id) return data.metadata.organization_id;
  if (data.metadata && data.metadata.organizationId) return data.metadata.organizationId;
  
  // Check inside the event object
  if (data.event && data.event.organization_id) return data.event.organization_id;
  if (data.event && data.event.organizationId) return data.event.organizationId;
  
  // No suitable organization ID found
  return null;
}
