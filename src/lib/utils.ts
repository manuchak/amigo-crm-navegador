import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPhoneNumber = (phoneNumberString: string) => {
  if (!phoneNumberString) return 'No disponible';

  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }

  return phoneNumberString;
}

/**
 * Normalizes different call status formats from VAPI to a standard format
 */
export function normalizeCallStatus(endedReason: string | null): string | null {
  if (!endedReason) return null;
  
  const lowerReason = endedReason.toLowerCase();
  
  if (lowerReason.includes('complete')) return 'completed';
  if (lowerReason.includes('customer-did-not-answer') || lowerReason.includes('did-not-answer') || lowerReason.includes('no answer')) return 'customer-did-not-answer';
  if (lowerReason.includes('busy') || lowerReason.includes('ocupado')) return 'busy';
  if (lowerReason.includes('fail')) return 'failed';
  if (lowerReason.includes('queue')) return 'queued';
  
  return 'queued'; // Default value if none of the above match
}

/**
 * Gets a color class for call status badge based on the status
 */
export function getCallStatusColor(endedReason: string | null): string {
  if (!endedReason) return 'bg-slate-100 text-slate-700';
  
  const normalizedStatus = normalizeCallStatus(endedReason);
  
  switch (normalizedStatus) {
    case 'completed':
      return 'bg-green-100 border-green-400 text-green-700';
    case 'customer-did-not-answer':
      return 'bg-amber-100 border-amber-400 text-amber-700';
    case 'busy':
      return 'bg-yellow-100 border-yellow-400 text-yellow-700';
    case 'failed':
      return 'bg-red-100 border-red-400 text-red-700';
    case 'queued':
      return 'bg-blue-100 border-blue-400 text-blue-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

/**
 * Gets a human-readable label for call status
 */
export function getCallStatusLabel(endedReason: string | null): string {
  if (!endedReason) return 'Sin información';
  
  const normalizedStatus = normalizeCallStatus(endedReason);
  
  switch (normalizedStatus) {
    case 'completed':
      return 'Completada';
    case 'customer-did-not-answer':
      return 'No contestó';
    case 'busy':
      return 'Ocupado';
    case 'failed':
      return 'Fallida';
    case 'queued':
      return 'En cola';
    default:
      return endedReason;
  }
}
