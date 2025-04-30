
/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  
  return new Intl.NumberFormat('es-MX').format(value);
}

/**
 * Formatea un número como moneda (pesos mexicanos)
 * Improved to handle zero values and small amounts better
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return '$0';
  
  // Log the value for debugging
  console.log(`formatCurrency received: ${value}, type: ${typeof value}`);
  
  // If value is very close to zero but not exactly zero, display as $0.1
  if (Math.abs(value) > 0 && Math.abs(value) < 0.1) {
    return '$0.1';
  }
  
  // For zero value, just return $0 without decimals
  if (value === 0) return '$0';
  
  // For non-zero values, format with 1 decimal place as requested
  try {
    const formatted = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
    
    console.log(`Formatted currency ${value} to: ${formatted}`);
    return formatted;
  } catch (error) {
    console.error(`Error formatting currency value ${value}:`, error);
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
