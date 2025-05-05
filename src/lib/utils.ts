
// Add this to your utils.ts file or create it if it doesn't exist

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '—';
  
  // Remove non-numeric characters
  const cleanedNumber = phone.replace(/\D/g, '');
  
  // Format based on length - Mexican number format
  if (cleanedNumber.length === 10) {
    return `${cleanedNumber.slice(0, 3)}-${cleanedNumber.slice(3, 6)}-${cleanedNumber.slice(6)}`;
  } else if (cleanedNumber.length > 10) {
    // International format
    return `+${cleanedNumber.slice(0, cleanedNumber.length - 10)} ${cleanedNumber.slice(-10, -7)}-${cleanedNumber.slice(-7, -4)}-${cleanedNumber.slice(-4)}`;
  }
  
  // Return formatted if possible, otherwise original
  return phone;
}

export function normalizeCallStatus(status: string | null): string | null {
  if (!status) return null;
  
  const lowercaseStatus = status.toLowerCase();
  
  if (lowercaseStatus.includes('complete') || lowercaseStatus.includes('success')) {
    return 'completed';
  } else if (lowercaseStatus.includes('no-answer') || lowercaseStatus.includes('no answer')) {
    return 'customer-did-not-answer';
  } else if (lowercaseStatus.includes('busy')) {
    return 'busy';
  } else if (lowercaseStatus.includes('queue')) {
    return 'queued';
  } else if (lowercaseStatus.includes('fail')) {
    return 'failed';
  } else if (lowercaseStatus.includes('no llamado')) {
    return 'no-call';
  }
  
  return lowercaseStatus;
}

/**
 * Gets the appropriate color class for a call status
 */
export function getCallStatusColor(status: string | null): string {
  if (!status) return 'text-slate-500 border-slate-200';
  
  const normalizedStatus = normalizeCallStatus(status);
  
  switch (normalizedStatus) {
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'customer-did-not-answer':
      return 'text-amber-600 bg-amber-50';
    case 'busy':
      return 'text-yellow-600 bg-yellow-50';
    case 'queued':
      return 'text-blue-600 bg-blue-50';
    case 'failed':
      return 'text-red-600 bg-red-50';
    case 'no-call':
      return 'text-slate-600 bg-slate-50 border border-slate-200';
    default:
      return 'text-slate-600 bg-slate-100';
  }
}

/**
 * Transforms a call status into a human-readable label
 */
export function getCallStatusLabel(status: string | null): string {
  if (!status) return 'Desconocido';
  
  const normalizedStatus = normalizeCallStatus(status);
  
  switch (normalizedStatus) {
    case 'completed':
      return 'Completada';
    case 'customer-did-not-answer':
      return 'No contestó';
    case 'busy':
      return 'Ocupado';
    case 'queued':
      return 'En cola';
    case 'failed':
      return 'Fallida';
    case 'no-call':
      return 'No llamado';
    default:
      return status;
  }
}

// Add more utility functions as needed...
