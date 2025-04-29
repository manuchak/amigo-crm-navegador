
/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  
  return new Intl.NumberFormat('es-MX').format(value);
}

/**
 * Formatea un número como moneda (pesos mexicanos)
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return '$0';
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formatea un porcentaje con el número especificado de decimales
 */
export function formatPercentage(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null) return '0%';
  
  return `${value.toFixed(decimals)}%`;
}
