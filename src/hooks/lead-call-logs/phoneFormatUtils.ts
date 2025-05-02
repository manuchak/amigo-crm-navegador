
/**
 * Formats a phone number for search purposes
 */
export function formatPhoneForSearch(phoneNumber: string | null): { 
  formattedNumber: string | null; 
  lastTenDigits: string | null;
  lastSevenDigits: string | null;
} {
  if (!phoneNumber) {
    return { formattedNumber: null, lastTenDigits: null, lastSevenDigits: null };
  }
  
  // Clean the phone number - strip all non-digits
  const formattedNumber = phoneNumber.trim().replace(/\D/g, '');
  
  // If the number is very short (less than 7 digits), it's likely invalid
  if (formattedNumber.length < 7) {
    return { formattedNumber, lastTenDigits: null, lastSevenDigits: null };
  }
  
  // Use the last 10 digits for matching (ignoring country code differences)
  const lastTenDigits = formattedNumber.length >= 10 
    ? formattedNumber.slice(-10) 
    : formattedNumber;
    
  // Also extract last 7 digits for more lenient matching if needed
  const lastSevenDigits = formattedNumber.slice(-7);
  
  return { formattedNumber, lastTenDigits, lastSevenDigits };
}
