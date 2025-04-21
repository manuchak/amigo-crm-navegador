
/**
 * Utilities for phone number formatting and extraction
 */

/**
 * Format phone number to international format
 */
export function formatPhoneNumberIntl(phoneNumber: string | null | undefined): string | null {
  if (!phoneNumber) {
    return null;
  }

  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Get the last 10 digits for Mexican numbers
  const lastTenDigits = digitsOnly.slice(-10);

  // Add the +52 prefix for Mexican numbers
  return lastTenDigits ? `+52${lastTenDigits}` : null;
}

/**
 * Extract raw phone number in numeric format
 */
export function extractRawPhoneNumber(phoneNumber: string | null | undefined): number | null {
  if (!phoneNumber) {
    return null;
  }
  
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  const lastTenDigits = digitsOnly.slice(-10);
  return lastTenDigits ? Number(lastTenDigits) : null;
}

/**
 * Helper function to extract phone number from various payload structures
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
