
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
 */
export function isValidCurrency(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  // If already a number, just check validity
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }
  
  // If string, try to clean and convert
  if (typeof value === 'string') {
    // Remove common currency characters
    const cleanValue = value
      .replace(/\$/g, '')
      .replace(/€/g, '')
      .replace(/,/g, '.')
      .replace(/\s/g, '')
      .trim();
    
    // Try to parse as number
    const num = Number(cleanValue);
    return !isNaN(num) && isFinite(num);
  }
  
  // For other types, just try direct conversion
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
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
      sampleData: []
    };
  }
  
  let validItems = 0;
  let invalidItems = 0;
  let nullOrUndefined = 0;
  let emptyString = 0;
  let nonNumeric = 0;
  let numeric = 0;
  let sampleValues: any[] = [];
  
  // Get up to 5 samples
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const item = data[i];
    if (item && fieldName in item) {
      sampleValues.push({
        value: item[fieldName],
        type: typeof item[fieldName]
      });
    }
  }
  
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
    sampleData: sampleValues
  };
}
