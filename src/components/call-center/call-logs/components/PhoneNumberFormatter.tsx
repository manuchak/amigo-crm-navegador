
import React from 'react';
import { VapiCallLog } from '../types';

// Helper function to format phone number for display
export const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return 'Desconocido';
  
  // Remove non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format for display if it's a valid number
  if (digits.length >= 10) {
    // Format as international number if it has country code
    if (digits.length > 10) {
      const countryCode = digits.slice(0, digits.length - 10);
      const areaCode = digits.slice(digits.length - 10, digits.length - 7);
      const firstPart = digits.slice(digits.length - 7, digits.length - 4);
      const secondPart = digits.slice(digits.length - 4);
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    } else {
      // Format as local number
      const areaCode = digits.slice(0, 3);
      const firstPart = digits.slice(3, 6);
      const secondPart = digits.slice(6);
      return `(${areaCode}) ${firstPart}-${secondPart}`;
    }
  } else if (digits.length >= 7) {
    // Handle shorter numbers (without area code)
    const firstPart = digits.slice(0, 3);
    const secondPart = digits.slice(3);
    return `${firstPart}-${secondPart}`;
  }
  
  // Return the original if we can't format it
  return phone;
};

// Enhanced helper function to display the best available phone number
export const getBestPhoneNumber = (log: VapiCallLog): string => {
  // First try the primary phone number fields
  for (const field of ['customer_number', 'caller_phone_number', 'phone_number']) {
    if (log[field] && typeof log[field] === 'string' && log[field].length > 5) {
      return formatPhoneNumber(log[field]);
    }
  }
  
  // If no phone numbers in primary fields, check metadata for any phone-like fields
  if (log.metadata && typeof log.metadata === 'object') {
    for (const key of Object.keys(log.metadata)) {
      const value = log.metadata[key];
      // Look for fields that might contain phone numbers
      if (
        typeof value === 'string' && 
        value.length >= 7 && 
        (key.toLowerCase().includes('phone') || 
         key.toLowerCase().includes('number') ||
         key.toLowerCase().includes('tel') ||
         /^\+?[\d\s\(\)\-]+$/.test(value)) // Basic regex to match phone-like strings
      ) {
        return formatPhoneNumber(value);
      }
    }
  }
  
  // If still no phone number found, default to "Desconocido"
  return 'Desconocido';
};
