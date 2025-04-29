
/**
 * Calculates the percentage change between two values
 * @param actual Current value
 * @param anterior Previous value
 * @returns Percentage change, rounded to 1 decimal place
 */
export function calcularPorcentajeCambio(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return Number(((actual - anterior) / anterior * 100).toFixed(1));
}

/**
 * Checks if a value is a valid number (not NaN, not undefined, not null)
 * @param value Value to check
 * @returns True if the value is a valid number, false otherwise
 */
export function isValidNumber(value: any): boolean {
  // Handle undefined objects with _type property (seen in console logs)
  if (value && typeof value === 'object' && value._type === 'undefined') {
    return false;
  }
  
  // Convert to number first to handle string numbers
  const num = Number(value);
  return value !== undefined && value !== null && !isNaN(num) && isFinite(num);
}

/**
 * Gets a valid number or returns 0 if invalid
 * @param value Value to check
 * @returns The value if valid, 0 otherwise
 */
export function getValidNumberOrZero(value: any): number {
  // Add debugging to track problematic values
  if (!isValidNumber(value)) {
    console.log("Invalid number detected:", value, typeof value);
    return 0;
  }
  return Number(value);
}

/**
 * Calculate the average of an array of numbers, handling invalid values
 * @param values Array of values to average
 * @returns Average value or 0 if no valid values
 */
export function calculateAverage(values: any[]): number {
  if (!values || values.length === 0) return 0;
  
  let sum = 0;
  let count = 0;
  
  for (const value of values) {
    if (isValidNumber(value)) {
      sum += Number(value);
      count++;
    }
  }
  
  return count > 0 ? Number((sum / count).toFixed(1)) : 0;
}
