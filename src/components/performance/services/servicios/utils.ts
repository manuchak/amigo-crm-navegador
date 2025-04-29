
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
  return value !== undefined && value !== null && !isNaN(Number(value));
}

/**
 * Gets a valid number or returns 0 if invalid
 * @param value Value to check
 * @returns The value if valid, 0 otherwise
 */
export function getValidNumberOrZero(value: any): number {
  return isValidNumber(value) ? Number(value) : 0;
}
