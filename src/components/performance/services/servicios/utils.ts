
/**
 * Safely gets a valid number or returns zero
 */
export function getValidNumberOrZero(value: any): number {
  if (value === undefined || value === null) return 0;
  
  // Handle different types
  if (typeof value === 'string') {
    // Clean up the string value (remove currency symbols, spaces, commas)
    const cleanVal = value
      .replace(/\$/g, '') // Remove dollar signs
      .replace(/\s/g, '') // Remove spaces
      .replace(/,/g, '.'); // Replace commas with periods for decimal
    
    const num = Number(cleanVal);
    return isNaN(num) ? 0 : num;
  }
  
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Calculates percentage change between two values
 */
export function calcularPorcentajeCambio(actual: number, anterior: number): number {
  if (anterior === 0) {
    return actual > 0 ? 100 : 0;
  }
  const cambio = ((actual - anterior) / Math.abs(anterior)) * 100;
  return Math.round(cambio * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculates the average of an array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (!values || values.length === 0) return 0;
  const validValues = values.filter(val => !isNaN(val));
  if (validValues.length === 0) return 0;
  
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / validValues.length) * 100) / 100; // Round to 2 decimal places
}

/**
 * Advanced currency parser with supercharged validation and format detection
 * Handles any conceivable currency format including international variations
 */
export function parseCurrencyValue(value: any): number {
  // Enhanced logging information for tracing the problem
  console.log(`parseCurrencyValue input:`, {
    value,
    type: typeof value,
    isNull: value === null,
    isUndefined: value === undefined,
    stringRepresentation: String(value)
  });

  // Handle null/undefined/empty cases
  if (value === undefined || value === null) return 0;
  
  // If it's already a number, validate and return
  if (typeof value === 'number') {
    if (isNaN(value)) {
      console.log("Value is NaN, returning 0");
      return 0;
    }
    console.log(`Value is already a number: ${value}`);
    return value;
  }
  
  // For string values, implement comprehensive parsing
  if (typeof value === 'string') {
    // Skip empty strings
    if (value.trim() === '') {
      console.log("Empty string value, returning 0");
      return 0;
    }
    
    // Step 1: Basic cleaning - remove currency symbols, spaces, letters
    let cleanVal = value
      .replace(/\$/g, '')    // Remove dollar signs
      .replace(/€/g, '')     // Remove euro signs
      .replace(/£/g, '')     // Remove pound signs
      .replace(/¥/g, '')     // Remove yen signs
      .replace(/MXN/gi, '')  // Remove currency code
      .replace(/USD/gi, '')  // Remove currency code
      .replace(/\s/g, '')    // Remove spaces
      .trim();
      
    // Additional cleaning for non-numeric characters except dots and commas
    cleanVal = cleanVal.replace(/[^\d.,\-]/g, '');
    
    console.log(`After basic cleaning: "${cleanVal}"`);
    
    // Step 2: Format detection and normalization
    const hasComma = cleanVal.indexOf(',') > -1;
    const hasPeriod = cleanVal.indexOf('.') > -1;
    
    // Count decimals to help determine format
    const commaCount = (cleanVal.match(/,/g) || []).length;
    const periodCount = (cleanVal.match(/\./g) || []).length;
    
    console.log(`Format detection: commas=${commaCount}, periods=${periodCount}`);
    
    // Handle different currency format patterns
    if (hasComma && !hasPeriod) {
      // Check if this is a decimal comma (European style) or thousands separator
      if (/,\d{1,2}$/.test(cleanVal)) {
        // Comma is likely the decimal separator (European style like "1234,56")
        console.log("Format detected: European (comma as decimal)");
        cleanVal = cleanVal.replace(/,/g, '.');
      } else {
        // Comma is likely thousands separator (like "1,234")
        console.log("Format detected: Commas as thousands separators");
        cleanVal = cleanVal.replace(/,/g, '');
      }
    } else if (hasComma && hasPeriod) {
      // Check which character appears last to determine decimal separator
      const lastCommaIndex = cleanVal.lastIndexOf(',');
      const lastPeriodIndex = cleanVal.lastIndexOf('.');
      
      if (lastCommaIndex > lastPeriodIndex) {
        // European format - 1.234,56 (comma is decimal separator)
        console.log("Format detected: European (period thousands, comma decimal)");
        // First remove all periods (thousands separators)
        cleanVal = cleanVal.replace(/\./g, '');
        // Then replace comma with period for decimal point
        cleanVal = cleanVal.replace(',', '.');
      } else {
        // Mexican/US format - 1,234.56 (comma is thousands separator)
        console.log("Format detected: Mexican/US (comma thousands, period decimal)");
        // Simply remove all commas
        cleanVal = cleanVal.replace(/,/g, '');
      }
    } else if (commaCount > 1) {
      // Multiple commas like "1,234,567" - commas are thousands separators
      console.log("Format detected: Multiple commas as thousands separators");
      cleanVal = cleanVal.replace(/,/g, '');
    } else if (periodCount > 1) {
      // Multiple periods like "1.234.567" - periods are thousands separators (European)
      console.log("Format detected: Multiple periods as thousands separators");
      // In this case, treating the last period as decimal separator
      const parts = cleanVal.split('.');
      const decimal = parts.pop();
      const integer = parts.join('');
      cleanVal = integer + '.' + decimal;
    }
    
    console.log(`After format normalization: "${cleanVal}"`);
    
    // Step 3: Parse the normalized value
    try {
      const num = parseFloat(cleanVal);
      
      if (!isNaN(num)) {
        console.log(`Successfully parsed as number: ${num}`);
        return num;
      }
    } catch (error) {
      console.error(`Error parsing "${cleanVal}":`, error);
    }
    
    // Step 4: Aggressive recovery attempt - extract any numeric portion
    try {
      const numericMatch = cleanVal.match(/[-+]?\d*\.?\d+/);
      if (numericMatch) {
        const extractedNum = parseFloat(numericMatch[0]);
        console.log(`Recovered number via regex: ${extractedNum}`);
        return extractedNum;
      }
    } catch (error) {
      console.error("Regex extraction failed:", error);
    }
  }
  
  // For non-string types, try converting to string first
  if (typeof value !== 'string' && value !== undefined && value !== null) {
    try {
      const stringVal = String(value);
      console.log(`Converting non-string value to string: "${stringVal}"`);
      return parseCurrencyValue(stringVal);
    } catch (error) {
      console.error(`Failed to convert to string:`, error);
    }
  }
  
  console.log(`No valid number could be extracted, returning 0`);
  return 0;
}

/**
 * Direct currency converter - simplest implementation
 * For cases where we need to bypass the complex logic
 */
export function directCurrencyConverter(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  
  if (typeof value === 'string') {
    // Remove any obvious non-numeric characters
    const cleanVal = value.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleanVal);
    return isNaN(num) ? 0 : num;
  }
  
  return 0;
}
