
import { VapiCallLog } from '../types';

/**
 * Formats a phone number string for display
 */
export const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return 'N/A';
  
  // Remove non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format for display if it's a valid number
  if (digits.length >= 10) {
    // Format as international number if it has country code
    if (digits.length > 10) {
      const countryCode = digits.slice(0, digits.length - 10);
      const areaCode = digits.slice(digits.length - 10, digits.length - 7);
      const firstPart = digits.slice(digits.length - 7, digits.length - 4);
      const secondPart = digits.slice(digits.length - 4);
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    } else {
      // Format as local number
      const areaCode = digits.slice(0, 3);
      const firstPart = digits.slice(3, 6);
      const secondPart = digits.slice(6);
      return `(${areaCode}) ${firstPart}-${secondPart}`;
    }
  }
  
  // Return the original if we can't format it
  return phone;
};

/**
 * Gets the best available phone number from a call log
 * Updated to prioritize the VAPI API customer.number format
 */
export const getBestPhoneNumber = (log: VapiCallLog): string => {
  // First check for the specific VAPI customer number format
  if (log.metadata && typeof log.metadata === 'object') {
    // Check for vapi_customer_number that we've added during the API fetch
    const metadataObj = log.metadata as Record<string, any>;
    if (metadataObj.vapi_customer_number && typeof metadataObj.vapi_customer_number === 'string') {
      return formatPhoneNumber(metadataObj.vapi_customer_number);
    }
    
    // Check for customer object structure as documented by VAPI
    if (metadataObj.customer && typeof metadataObj.customer === 'object' && metadataObj.customer.number) {
      return formatPhoneNumber(metadataObj.customer.number);
    }
  }
  
  // Direct customer_number is our next priority
  if (log.customer_number) {
    return formatPhoneNumber(log.customer_number);
  }
  
  // For incoming calls, the caller_phone_number should be the customer
  if (log.direction === 'inbound' && log.caller_phone_number) {
    return formatPhoneNumber(log.caller_phone_number);
  }
  
  // For outgoing calls, the phone_number is often the customer
  if ((log.direction === 'outbound' || log.direction === 'outboundPhoneCall') && log.phone_number) {
    return formatPhoneNumber(log.phone_number);
  }
  
  // Try to extract data from metadata for most reliable phone info
  if (log.metadata && typeof log.metadata === 'object') {
    const metadataObj = log.metadata as Record<string, any>;
    
    // Explicitly look for customer number in the fallbackDestination structure
    if (metadataObj.fallbackDestination && typeof metadataObj.fallbackDestination === 'object') {
      if (metadataObj.fallbackDestination.number) {
        return formatPhoneNumber(metadataObj.fallbackDestination.number);
      }
    }
    
    // Look for the customer number in VAPI format
    if (metadataObj.number && typeof metadataObj.number === 'string') {
      return formatPhoneNumber(metadataObj.number);
    }
    
    if (metadataObj.phoneNumber && typeof metadataObj.phoneNumber === 'string') {
      return formatPhoneNumber(metadataObj.phoneNumber);
    }
    
    // Check other common field names for customer numbers specifically
    const customerPhoneFields = [
      'customerNumber', 'customerPhoneNumber', 'callerNumber',
      'toNumber', 'fromNumber', 'recipientNumber', 'customer_phone'
    ];
    
    for (const field of customerPhoneFields) {
      if (metadataObj[field] && typeof metadataObj[field] === 'string') {
        return formatPhoneNumber(metadataObj[field]);
      }
    }
  }
  
  // Fallback to any available number in a priority order
  if (log.caller_phone_number) return formatPhoneNumber(log.caller_phone_number);
  if (log.phone_number) return formatPhoneNumber(log.phone_number);
  if (log.assistant_phone_number) return formatPhoneNumber(log.assistant_phone_number);
  
  // Default fallback
  return 'Sin número';
};
