/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  
  return new Intl.NumberFormat('es-MX').format(value);
}

/**
 * Formatea un número como moneda (pesos mexicanos)
 * Con manejo mejorado para valores en diferentes formatos
 */
export function formatCurrency(value: number | undefined | null): string {
  // Si el valor es undefined o null, retornamos $0
  if (value === undefined || value === null) {
    return '$0';
  }
  
  // Manejo explícito para NaN
  if (typeof value === 'number' && isNaN(value)) {
    return '$0';
  }
  
  // Para valores muy pequeños pero no cero, mostrar como $0.1 para indicar que hay algún valor
  if (Math.abs(value) > 0 && Math.abs(value) < 0.1) {
    return '$0.1';
  }
  
  // Para valor cero, simplemente retornar $0 sin decimales
  if (value === 0) {
    return '$0';
  }
  
  try {
    // Forzamos formato español-México para asegurar símbolos $ y separadores consistentes
    const formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
    
    return formatter.format(value);
  } catch (error) {
    // Si falla Intl, caemos en un método simple de formateo
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
