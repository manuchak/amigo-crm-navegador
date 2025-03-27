
/**
 * Utility functions for requerimientos module
 */

/**
 * Get current time in HH:MM:SS format
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString();
};

/**
 * Get current month name in Spanish
 */
export const getCurrentMonth = (): string => {
  return new Date().toLocaleString('es-ES', { month: 'long' });
};

/**
 * Calculate effectiveness percentage
 */
export const calcularEfectividad = (realizados: number, previstos: number): number => {
  return Math.round((realizados / previstos) * 100);
};
