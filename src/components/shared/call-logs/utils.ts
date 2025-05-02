
import { VapiCallLog } from '@/components/leads/types';

/**
 * Formats a call date for display
 */
export function formatCallDateTime(dateString: string | null): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Formats call duration in seconds to a readable format
 */
export function formatCallDuration(seconds: number | null): string {
  if (!seconds) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Gets the best available phone number from a call log
 */
export function getBestPhoneNumber(log: VapiCallLog): string {
  return log.customer_number || 
         log.caller_phone_number || 
         log.phone_number || 
         'No disponible';
}

/**
 * Formats a phone number for display
 */
export function formatPhoneNumber(phoneNumberString: string): string {
  if (!phoneNumberString) return 'No disponible';

  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }

  return phoneNumberString;
}
