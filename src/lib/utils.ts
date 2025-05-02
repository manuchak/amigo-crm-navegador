
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return "No disponible";
  
  // Handle international format: +52 1234567890
  if (phone.startsWith('+')) {
    // Remove any non-digit characters except the + sign at the beginning
    const cleaned = phone.replace(/(?!^\+)\D/g, '');
    
    if (cleaned.length >= 12) { // +52 + 10 digits
      return cleaned.replace(/(\+\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
    }
  }
  
  // For local format: remove any non-digit character
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  
  // Return original if no formatting matched
  return phone;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
