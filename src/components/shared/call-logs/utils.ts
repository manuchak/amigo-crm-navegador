
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CallFormattingOptions, VapiCallLog } from './types';

export const formatCallDuration = (seconds: number | null, includeSeconds: boolean = true) => {
  if (seconds === null || seconds === undefined) return '00:00';
  
  // Convert from milliseconds if needed
  if (seconds > 100000) {
    seconds = Math.floor(seconds / 1000);
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return includeSeconds 
    ? `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins} min`;
};

export const formatCallDateTime = (
  dateString: string | null, 
  options: CallFormattingOptions = {}
) => {
  if (!dateString) return 'N/A';
  
  try {
    const formatString = options.use24Hour 
      ? 'dd/MM/yyyy HH:mm'
      : 'dd/MM/yyyy hh:mm a';
      
    return format(parseISO(dateString), formatString, { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

export const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return 'N/A';
  
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length >= 10) {
    if (digits.length > 10) {
      const countryCode = digits.slice(0, digits.length - 10);
      const areaCode = digits.slice(digits.length - 10, digits.length - 7);
      const firstPart = digits.slice(digits.length - 7, digits.length - 4);
      const secondPart = digits.slice(digits.length - 4);
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    } else {
      const areaCode = digits.slice(0, 3);
      const firstPart = digits.slice(3, 6);
      const secondPart = digits.slice(6);
      return `(${areaCode}) ${firstPart}-${secondPart}`;
    }
  }
  
  return phone;
};

export const getBestPhoneNumber = (log: VapiCallLog): string => {
  // Try customer_number first
  if (log.customer_number) {
    return formatPhoneNumber(log.customer_number);
  }
  
  // Check metadata for customer number
  if (log.metadata && typeof log.metadata === 'object') {
    const metadataObj = log.metadata as Record<string, any>;
    
    if (metadataObj.vapi_customer_number) {
      return formatPhoneNumber(metadataObj.vapi_customer_number);
    }
    
    if (metadataObj.customer?.number) {
      return formatPhoneNumber(metadataObj.customer.number);
    }
  }
  
  // Use direction-specific logic
  if (log.direction === 'inbound' && log.caller_phone_number) {
    return formatPhoneNumber(log.caller_phone_number);
  }
  
  if (log.direction === 'outbound' && log.phone_number) {
    return formatPhoneNumber(log.phone_number);
  }
  
  // Final fallbacks
  return formatPhoneNumber(
    log.caller_phone_number || 
    log.phone_number || 
    log.assistant_phone_number || 
    'Sin número'
  );
};
