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

// Add more utility functions as needed...
