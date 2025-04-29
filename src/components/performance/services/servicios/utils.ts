
/**
 * Safely gets a valid number or returns zero
 */
export function getValidNumberOrZero(value: any): number {
  if (value === undefined || value === null) return 0;
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
