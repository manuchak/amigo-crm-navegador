/**
 * Utilities to validate and check data integrity
 */

/**
 * Checks if a value is a valid number (not NaN, finite, and not null/undefined)
 */
export function isValidNumber(value: any): boolean {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Checks if a currency value is valid (can be parsed to a number)
 * Enhanced to handle a wider variety of currency formats
 */
export function isValidCurrency(value: any): boolean {
  // Handle null/undefined/empty cases
  if (value === null || value === undefined || value === '') return false;
  
  // If already a number, just check validity
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }
  
  // If string, try to clean and convert using more flexible cleaning
  if (typeof value === 'string') {
    // More extensive cleaning to handle various formats
    let cleanValue = value
      .replace(/\$/g, '')     // Remove dollar signs
      .replace(/€/g, '')      // Remove euro signs
      .replace(/£/g, '')      // Remove pound signs
      .replace(/¥/g, '')      // Remove yen signs
      .replace(/MXN/gi, '')   // Remove currency code
      .replace(/USD/gi, '')   // Remove currency code
      .replace(/\s/g, '')     // Remove spaces
      .trim();
    
    // Handle various decimal/thousands separator formats
    if (cleanValue.includes(',') && cleanValue.includes('.')) {
      // Format like 1,234.56 (US/MX) or 1.234,56 (EU)
      const lastCommaIndex = cleanValue.lastIndexOf(',');
      const lastDotIndex = cleanValue.lastIndexOf('.');
      
      if (lastCommaIndex > lastDotIndex) {
        // European format - 1.234,56
        cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
      } else {
        // US/MX format - 1,234.56
        cleanValue = cleanValue.replace(/,/g, '');
      }
    } else if (cleanValue.includes(',') && !cleanValue.includes('.')) {
      // Could be 1,234 (US thousands) or 5,67 (EU decimal)
      // If there's only 2 digits after the comma, treat it as decimal separator
      const parts = cleanValue.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        cleanValue = cleanValue.replace(',', '.');
      } else {
        // Otherwise assume thousands separator
        cleanValue = cleanValue.replace(/,/g, '');
      }
    }
    
    // Try to parse as number
    const num = Number(cleanValue);
    return !isNaN(num) && isFinite(num);
  }
  
  // For other types, try direct conversion
  try {
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  } catch (e) {
    return false;
  }
}

/**
 * Analyzes an array of data to check for currency value validity
 * Returns statistics about the data quality
 */
export function analyzeDataQuality(data: any[], fieldName: string) {
  if (!data || !data.length) {
    return {
      totalItems: 0,
      validItems: 0,
      invalidItems: 0,
      nullOrUndefined: 0,
      emptyString: 0,
      nonNumeric: 0,
      numeric: 0,
      percentValid: 0,
      hasValidData: false,
      sampleData: [],
      originalValues: []
    };
  }
  
  let validItems = 0;
  let invalidItems = 0;
  let nullOrUndefined = 0;
  let emptyString = 0;
  let nonNumeric = 0;
  let numeric = 0;
  let sampleValues: any[] = [];
  let originalValues: any[] = [];
  
  // Get up to 5 samples plus store the raw values of all items
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const item = data[i];
    if (item && fieldName in item) {
      sampleValues.push({
        value: item[fieldName],
        type: typeof item[fieldName]
      });
    }
  }
  
  // Store raw values for all items to assist debugging
  data.slice(0, 20).forEach(item => {
    if (item && fieldName in item) {
      originalValues.push({
        value: item[fieldName],
        type: typeof item[fieldName]
      });
    }
  });
  
  // Analyze each item
  data.forEach(item => {
    if (!item || !(fieldName in item)) {
      invalidItems++;
      return;
    }
    
    const value = item[fieldName];
    
    if (value === null || value === undefined) {
      nullOrUndefined++;
      invalidItems++;
      return;
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      emptyString++;
      invalidItems++;
      return;
    }
    
    if (isValidCurrency(value)) {
      numeric++;
      validItems++;
    } else {
      nonNumeric++;
      invalidItems++;
    }
  });
  
  const totalItems = data.length;
  const percentValid = totalItems > 0 ? Math.round((validItems / totalItems) * 100) : 0;
  
  return {
    totalItems,
    validItems,
    invalidItems,
    nullOrUndefined,
    emptyString,
    nonNumeric,
    numeric,
    percentValid,
    hasValidData: validItems > 0,
    sampleData: sampleValues,
    originalValues
  };
}

/**
 * Simple utility to attempt converting a value to a number
 * allowing for various formats
 */
export function tryParseNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  if (typeof value === 'string') {
    if (value.trim() === '') return null;
    
    // Clean and normalize the string
    let cleanValue = value
      .replace(/\$/g, '')
      .replace(/€/g, '')
      .replace(/£/g, '')
      .replace(/¥/g, '')
      .replace(/MXN/gi, '')
      .replace(/USD/gi, '')
      .replace(/\s/g, '')
      .trim();
    
    // Handle various decimal/thousands separator formats
    if (cleanValue.includes(',') && cleanValue.includes('.')) {
      const lastCommaIndex = cleanValue.lastIndexOf(',');
      const lastDotIndex = cleanValue.lastIndexOf('.');
      
      if (lastCommaIndex > lastDotIndex) {
        // European format - 1.234,56
        cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
      } else {
        // US/MX format - 1,234.56
        cleanValue = cleanValue.replace(/,/g, '');
      }
    } else if (cleanValue.includes(',') && !cleanValue.includes('.')) {
      if (/,\d{1,2}$/.test(cleanValue)) {
        // Likely decimal separator (e.g., 5,99)
        cleanValue = cleanValue.replace(',', '.');
      } else {
        // Likely thousands separator (e.g., 1,234)
        cleanValue = cleanValue.replace(/,/g, '');
      }
    }
    
    const num = Number(cleanValue);
    return isNaN(num) ? null : num;
  }
  
  return null;
}
