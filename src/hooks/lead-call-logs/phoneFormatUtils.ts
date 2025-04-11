
/**
 * Formats a phone number for database search by removing non-digit characters
 * @param phoneNumber The phone number to format
 * @returns The formatted phone number
 */
export function formatPhoneForSearch(phoneNumber: string | null): { 
  formattedNumber: string | null;
  lastTenDigits: string | null;
  lastSevenDigits: string | null;
} {
  if (!phoneNumber) {
    return { formattedNumber: null, lastTenDigits: null, lastSevenDigits: null };
  }

  // Extract only digits
  const formattedNumber = phoneNumber.trim().replace(/\D/g, '');
  
  // If the phone number is very short (less than 7 digits), it's likely invalid
  if (formattedNumber.length < 7) {
    console.warn('Phone number too short, might be invalid:', phoneNumber);
    return { formattedNumber: null, lastTenDigits: null, lastSevenDigits: null };
  }
  
  // Get the last 10 digits for matching (ignoring country code differences)
  const lastTenDigits = formattedNumber.slice(-10);
  
  // Get the last 7 digits for more lenient matching
  const lastSevenDigits = formattedNumber.slice(-7);
  
  return { formattedNumber, lastTenDigits, lastSevenDigits };
}
