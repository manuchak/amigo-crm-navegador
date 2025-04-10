
import { CONFIG } from './config.ts';

/**
 * Response Parser
 */
export class ResponseParser {
  /**
   * Extract logs from various response formats
   */
  static extractLogsFromResponse(data) {
    if (!data) {
      console.log('No data received from VAPI API')
      return []
    }
    
    // Log the exact structure received to help diagnose format
    console.log("Response data type:", typeof data)
    console.log("Response has data property:", "data" in data)
    console.log("Response has calls property:", "calls" in data)
    console.log("Response is array:", Array.isArray(data))
    
    // Additional logging for deeper nested properties
    if (typeof data === 'object' && data !== null) {
      if (data.data) console.log("data.data type:", typeof data.data, "is array:", Array.isArray(data.data))
      if (data.calls) console.log("data.calls type:", typeof data.calls, "is array:", Array.isArray(data.calls))
      if (data.results) console.log("data.results type:", typeof data.results, "is array:", Array.isArray(data.results))
      
      // Check for phone number and duration fields specifically
      const sampleObject = this.getSampleObject(data);
      if (sampleObject) {
        console.log("Sample object properties:", Object.keys(sampleObject))
        console.log("Phone number fields:", this.findPhoneNumberFields(sampleObject))
        console.log("Duration field:", sampleObject.duration, "type:", typeof sampleObject.duration)
        
        // Additional detailed logging about field names to help debug
        console.log("All fields in sample object:", Object.entries(sampleObject)
          .map(([key, value]) => `${key}: ${typeof value} = ${JSON.stringify(value)}`)
          .join(', '))
      }
    }
    
    let logs = []
    
    // Try different response formats
    if (Array.isArray(data)) {
      logs = data
      console.log(`Retrieved ${logs.length} logs from VAPI API (array format)`)
    } else if (data && Array.isArray(data.data)) {
      logs = data.data
      console.log(`Retrieved ${logs.length} logs from VAPI API (data format)`)
    } else if (data && Array.isArray(data.calls)) {
      logs = data.calls
      console.log(`Retrieved ${logs.length} logs from VAPI API (calls format)`)
    } else if (data && data.results && Array.isArray(data.results)) {
      logs = data.results
      console.log(`Retrieved ${logs.length} logs from VAPI API (results format)`)
    } else if (data && typeof data === 'object' && data.metadata && Array.isArray(data.metadata.calls)) {
      logs = data.metadata.calls
      console.log(`Retrieved ${logs.length} logs from VAPI API (metadata.calls format)`)
    } else if (data && data.data && typeof data.data === 'object' && Array.isArray(data.data.records)) {
      logs = data.data.records
      console.log(`Retrieved ${logs.length} logs from VAPI API (data.records format)`)
    } else if (data && data.records && Array.isArray(data.records)) {
      logs = data.records
      console.log(`Retrieved ${logs.length} logs from VAPI API (records format)`)
    } else if (data && data.items && Array.isArray(data.items)) {
      logs = data.items
      console.log(`Retrieved ${logs.length} logs from VAPI API (items format)`)
    } else {
      // If no recognized format is found, log the structure for debugging
      console.log('Response data structure:', JSON.stringify(data).substring(0, 300))
      console.log('No logs found in VAPI API response or unexpected format')
    }

    // Log details of first item if available
    if (logs && logs.length > 0) {
      console.log('Sample log item:', JSON.stringify(logs[0]).substring(0, 300))
      
      // Detailed phone number field inspection of first log
      const phoneFields = this.inspectPhoneNumberFields(logs[0]);
      console.log('Phone number fields in first log:', phoneFields);
    }

    return logs || []
  }

  /**
   * Extract a sample object from any of the possible data structures
   */
  static getSampleObject(data) {
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    if (data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data[0];
    }
    if (data && Array.isArray(data.calls) && data.calls.length > 0) {
      return data.calls[0];
    }
    if (data && Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  }

  /**
   * Find all potential phone number fields in an object
   */
  static findPhoneNumberFields(obj) {
    if (!obj || typeof obj !== 'object') return [];
    
    const phoneFields = [];
    for (const [key, value] of Object.entries(obj)) {
      if (
        typeof value === 'string' && 
        (key.toLowerCase().includes('phone') || 
         key.toLowerCase().includes('caller') ||
         key.toLowerCase().includes('customer') ||
         key.toLowerCase().includes('recipient') ||
         key.toLowerCase().includes('number') ||
         key === 'to' ||
         key === 'from')
      ) {
        phoneFields.push({ key, value });
      }
    }
    return phoneFields;
  }
  
  /**
   * Inspect and log all phone number related fields in a log entry
   */
  static inspectPhoneNumberFields(log) {
    if (!log || typeof log !== 'object') {
      return { error: 'Invalid log entry' };
    }
    
    // Collect all fields that might contain phone numbers
    const phoneFields = {};
    const possibleKeys = [
      'phone_number', 'phoneNumber', 'caller_number', 'callerNumber',
      'caller_phone_number', 'callerPhoneNumber', 'customer_number', 'customerNumber',
      'customer_phone', 'customerPhone', 'from', 'to', 'toPhoneNumber', 'to_phone_number',
      'phone', 'number', 'fromNumber', 'from_number', 'recipientPhone', 'recipientNumber',
      'recipient', 'toNumber', 'receiver', 'receiverNumber'
    ];
    
    // Check each possible key
    for (const key of possibleKeys) {
      if (key in log && log[key]) {
        phoneFields[key] = log[key];
      }
    }
    
    // Check nested objects - first in metadata
    if (log.metadata && typeof log.metadata === 'object') {
      for (const key of possibleKeys) {
        if (key in log.metadata && log.metadata[key]) {
          phoneFields[`metadata.${key}`] = log.metadata[key];
        }
      }
      
      // Special case for explicitly requested phone number metadata
      CONFIG.METADATA_REQUEST_FIELDS.forEach(field => {
        if (log.metadata[field]) {
          phoneFields[`metadata.${field}`] = log.metadata[field];
        }
      });
    }
    
    // Also check for non-standard field names that might contain phone numbers
    for (const [key, value] of Object.entries(log)) {
      if (
        typeof value === 'string' && 
        !phoneFields[key] &&
        (key.toLowerCase().includes('phone') || 
         key.toLowerCase().includes('number') ||
         key.toLowerCase().includes('caller') ||
         key.toLowerCase().includes('customer') ||
         key.toLowerCase().includes('recipient'))
      ) {
        phoneFields[key] = value;
      }
    }
    
    return phoneFields;
  }
  
  /**
   * Attempt to find the most appropriate value for a specific field
   */
  static findFieldValue(log, fieldType) {
    // Use our field mapping to check all possible field variations
    const possibleFieldNames = Object.keys(CONFIG.FIELD_MAPPING)
      .filter(key => CONFIG.FIELD_MAPPING[key] === fieldType);
    
    // Try standard field names first
    for (const fieldName of possibleFieldNames) {
      if (log[fieldName] !== undefined && log[fieldName] !== null) {
        return log[fieldName];
      }
    }
    
    // Try camelCase and snake_case variations
    const fieldNameVariations = [];
    for (const fieldName of possibleFieldNames) {
      // Add camelCase variation
      fieldNameVariations.push(fieldName.replace(/(_\w)/g, m => m[1].toUpperCase()));
      // Add snake_case variation
      fieldNameVariations.push(fieldName.replace(/([A-Z])/g, m => `_${m.toLowerCase()}`));
    }
    
    for (const fieldName of fieldNameVariations) {
      if (log[fieldName] !== undefined && log[fieldName] !== null) {
        return log[fieldName];
      }
    }
    
    // Try metadata if available
    if (log.metadata && typeof log.metadata === 'object') {
      // First check standard field names in metadata
      for (const fieldName of [...possibleFieldNames, ...fieldNameVariations]) {
        if (log.metadata[fieldName] !== undefined && log.metadata[fieldName] !== null) {
          return log.metadata[fieldName];
        }
      }
      
      // Then check explicit metadata request fields
      if (fieldType === 'customer_number') {
        for (const requestField of ['customerNumber', 'customerPhoneNumber', 'recipientNumber', 'toNumber']) {
          if (log.metadata[requestField]) {
            return log.metadata[requestField];
          }
        }
      }
    }
    
    // Return null if not found
    return null;
  }
}
