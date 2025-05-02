import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return "No disponible";
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different phone number formats
  if (digits.length === 10) {
    // Format as (XXX) XXX-XXXX for 10-digit numbers
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length > 10) {
    // For international numbers with country code
    if (digits.startsWith('52')) {
      // Mexican numbers with country code 52
      const nationalNumber = digits.slice(2);
      if (nationalNumber.length === 10) {
        return `+52 (${nationalNumber.slice(0, 3)}) ${nationalNumber.slice(3, 6)}-${nationalNumber.slice(6)}`;
      }
    }
    
    // Other international numbers - format with country code
    // Extract what is likely the country code (1-3 digits), then the rest as a standard number
    const countryCodeLength = Math.min(3, digits.length - 10);
    const countryCode = digits.slice(0, countryCodeLength);
    const areaCode = digits.slice(countryCodeLength, countryCodeLength + 3);
    const middle = digits.slice(countryCodeLength + 3, countryCodeLength + 6);
    const last = digits.slice(countryCodeLength + 6);
    
    return `+${countryCode} (${areaCode}) ${middle}-${last}`;
  }
  
  // Fall back to simplified format for any other cases
  if (digits.length > 4) {
    const firstPart = digits.slice(0, Math.ceil(digits.length / 2));
    const secondPart = digits.slice(Math.ceil(digits.length / 2));
    return `+${firstPart}-${secondPart}`;
  }
  
  // For very short numbers, just return as is
  return phone;
}
