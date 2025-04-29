
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
