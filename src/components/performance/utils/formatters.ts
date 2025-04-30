/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  
  return new Intl.NumberFormat('es-MX').format(value);
}

/**
 * Formatea un número como moneda (pesos mexicanos)
 * Enhanced to handle problematic values better with improved logging
 */
export function formatCurrency(value: number | undefined | null): string {
  // Log the incoming value for debugging purposes
  console.log(`formatCurrency called with: ${value} (type: ${typeof value})`);
  
  if (value === undefined || value === null) {
    console.log('Value is null/undefined, returning $0');
    return '$0';
  }
  
  // Handle NaN values explicitly
  if (typeof value === 'number' && isNaN(value)) {
    console.log('Value is NaN, returning $0');
    return '$0';
  }
  
  // For very small but non-zero values, show as $0.1 to indicate there is some value
  if (Math.abs(value) > 0 && Math.abs(value) < 0.1) {
    console.log(`Small value ${value}, displaying as $0.1`);
    return '$0.1';
  }
  
  // For zero value, just return $0 without decimals
  if (value === 0) {
    console.log('Value is 0, returning $0');
    return '$0';
  }
  
  // For non-zero values, format with 1 decimal place as requested
  try {
    // Forcing Spanish-Mexico format to ensure consistent $ symbol and separators
    const formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
    
    const formatted = formatter.format(value);
    console.log(`Formatted ${value} as: ${formatted}`);
    return formatted;
  } catch (error) {
    console.error(`Error formatting value ${value}:`, error);
    
    // Fall back to a simple formatting method if Intl fails
    return `$${value.toFixed(1)}`;
  }
}

/**
 * Formatea un porcentaje con el número especificado de decimales
 */
export function formatPercentage(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null) return '0%';
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formatea una duración (en minutos) como texto legible
 */
export function formatDuration(minutes: number | undefined | null): string {
  if (minutes === undefined || minutes === null) return '0 min';
  
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? 
      `${hours}h ${remainingMinutes}m` : 
      `${hours}h`;
  }
}

/**
 * Formatea una fecha en formato corto
 */
export function formatShortDate(date: Date | string | undefined | null): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short'
  }).format(dateObj);
}

/**
 * Formatea una cantidad de km
 */
export function formatDistance(km: number | undefined | null): string {
  if (km === undefined || km === null) return '0 km';
  
  return `${formatNumber(km)} km`;
}
