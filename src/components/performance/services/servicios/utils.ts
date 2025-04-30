
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
 * Parse a possibly formatted currency string to a number
 * Enhanced version for Mexican currency formats and more edge cases
 */
export function parseCurrencyValue(value: any): number {
  // First, log the original input for debugging
  console.log(`parseCurrencyValue called with:`, { 
    value, 
    type: typeof value,
    isNull: value === null,
    isUndefined: value === undefined
  });

  if (value === undefined || value === null) return 0;
  
  // If it's already a number, ensure it's valid
  if (typeof value === 'number') {
    if (isNaN(value)) return 0;
    console.log(`Value is already a number: ${value}`);
    return value;
  }
  
  // If it's a string, clean it and convert it
  if (typeof value === 'string') {
    // Handle Mexican currency format: "$1,234.56" or "$ 1 234,56"
    let cleanVal = value
      .replace(/\$/g, '')   // Remove dollar signs
      .replace(/\s/g, '')   // Remove spaces
      .trim();
    
    // Check common currency formats
    // Mexican/US format: 1,234.56 (comma as thousands, dot as decimal)
    // European format: 1.234,56 (dot as thousands, comma as decimal)
    const hasComma = cleanVal.indexOf(',') > -1;
    const hasPeriod = cleanVal.indexOf('.') > -1;
    
    if (hasComma && !hasPeriod) {
      // Case like "1234,56" - comma is the decimal separator (European style)
      cleanVal = cleanVal.replace(/,/g, '.');
    } else if (hasComma && hasPeriod) {
      // Mexican format case like "1,234.56" - comma is thousands separator
      // Check which character appears last to determine decimal separator
      const lastCommaIndex = cleanVal.lastIndexOf(',');
      const lastPeriodIndex = cleanVal.lastIndexOf('.');
      
      if (lastCommaIndex > lastPeriodIndex) {
        // European format - 1.234,56 (comma is decimal separator)
        cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
      } else {
        // Mexican/US format - 1,234.56 (comma is thousands separator)
        cleanVal = cleanVal.replace(/,/g, '');
      }
    }
    
    console.log(`Cleaned currency value "${value}" to: "${cleanVal}"`);
    
    // Parse as float
    const num = parseFloat(cleanVal);
    if (!isNaN(num)) {
      console.log(`Successfully parsed as number: ${num}`);
      return num;
    }
    
    // If parsing fails, try more aggressive cleaning
    const digitsOnly = cleanVal.replace(/[^0-9.]/g, '');
    if (digitsOnly) {
      const parsedAgain = parseFloat(digitsOnly);
      const result = isNaN(parsedAgain) ? 0 : parsedAgain;
      console.log(`Aggressive parsing resulted in: ${result}`);
      return result;
    }
  }
  
  console.log(`Couldn't parse value, returning 0`);
  return 0;
}
