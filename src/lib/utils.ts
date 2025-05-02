
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a phone number for display
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "Sin teléfono";
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a Mexico number (usually starts with +52)
  if (phoneNumber.includes('+52') || phoneNumber.startsWith('52')) {
    // Format as Mexican number +52 XX XXXX XXXX
    if (cleaned.length >= 10) {
      const lastTen = cleaned.slice(-10);
      return `+52 ${lastTen.slice(0, 2)} ${lastTen.slice(2, 6)} ${lastTen.slice(6)}`;
    }
  }
  
  // Generic international format
  return phoneNumber;
}

/**
 * Normalizes different call ended_reason values to standardized status categories
 */
export function normalizeCallStatus(reason: string | null): string | null {
  if (!reason) return null;
  
  const lowerReason = reason.toLowerCase();
  
  if (lowerReason.includes('complete')) return 'completed';
  if (lowerReason.includes('no-answer') || lowerReason.includes('no answer')) return 'no-answer';
  if (lowerReason.includes('busy') || lowerReason.includes('ocupado')) return 'busy';
  if (lowerReason.includes('fail')) return 'failed';
  if (lowerReason.includes('assistant-ended-call-with-hangup-task')) return 'contacted';
  
  return null;
}

// Get a color class based on call status
export function getCallStatusColor(status: string | null): string {
  if (!status) return "bg-slate-100 border-slate-300 text-slate-600";
  
  switch (normalizeCallStatus(status)) {
    case 'completed':
      return "bg-green-100 border-green-400 text-green-700";
    case 'no-answer':
      return "bg-amber-100 border-amber-400 text-amber-700";
    case 'busy':
      return "bg-yellow-100 border-yellow-400 text-yellow-700";
    case 'failed':
      return "bg-red-100 border-red-400 text-red-700";
    case 'contacted':
      return "bg-blue-100 border-blue-400 text-blue-700";
    default:
      return "bg-slate-100 border-slate-300 text-slate-600";
  }
}

// Get a display name for call status
export function getCallStatusLabel(status: string | null): string {
  if (!status) return "Desconocido";
  
  switch (normalizeCallStatus(status)) {
    case 'completed':
      return "Completada";
    case 'no-answer':
      return "Sin Respuesta";
    case 'busy':
      return "Ocupado";
    case 'failed':
      return "Fallida";
    case 'contacted':
      return "Contactado";
    default:
      return status;
  }
}
