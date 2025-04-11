/**
 * Extract the best customer phone number
 */
export function extractCustomerNumber(log) {
  // First check for the customer object structure as documented by VAPI
  if (log.customer && log.customer.number) {
    const customerNumber = log.customer.number;
    console.log(`Found customer.number in log: ${customerNumber}`);
    return customerNumber;
  }
  
  // Check metadata for VAPI-specific customer number (that we might have added)
  if (log.metadata && log.metadata.vapi_customer_number) {
    const customerNumber = log.metadata.vapi_customer_number;
    console.log(`Found vapi_customer_number in metadata: ${customerNumber}`);
    return customerNumber;
  }
  
  // If still no customer number, use the fallback extraction logic from ResponseParser
  if (log.metadata && typeof log.metadata === 'object') {
    // Check for common customer number fields in metadata
    const metadataObj = log.metadata;
    
    // Check for customer object structure
    if (metadataObj.customer && typeof metadataObj.customer === 'object' && metadataObj.customer.number) {
      return metadataObj.customer.number;
    }
    
    // Look for other common field names
    const customerPhoneFields = [
      'customerNumber', 'customerPhoneNumber', 'callerNumber',
      'toNumber', 'fromNumber', 'recipientNumber', 'customer_phone'
    ];
    
    for (const field of customerPhoneFields) {
      if (metadataObj[field] && typeof metadataObj[field] === 'string') {
        return metadataObj[field];
      }
    }
  }
  
  return null;
}

/**
 * Find the best phone number based on call direction
 */
export function findBestPhoneNumber(log, customerNumber, callerNumber, phoneNumber) {
  // If we have a customer number, use that
  if (customerNumber) return customerNumber;
  
  // Otherwise, try to determine based on call direction
  if (log.direction === 'inbound' && callerNumber) {
    return callerNumber;
  } else if (log.direction === 'outbound' && phoneNumber) {
    return phoneNumber;
  }
  
  // Fallback to any available number
  return phoneNumber || callerNumber || null;
}
