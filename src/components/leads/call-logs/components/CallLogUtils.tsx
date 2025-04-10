
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { VapiCallLog } from '../../types';

export const formatDateTime = (dateTimeString: string | null) => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  return date.toLocaleString('es-MX', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatDuration = (seconds: number | null) => {
  if (!seconds) return 'N/A';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return 'Sin número';
  
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
  }
  
  // Return the original if we can't format it
  return phone;
};

export const getStatusBadge = (status: string | null) => {
  if (!status) return <Badge variant="outline">Desconocido</Badge>;
  
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge className="bg-green-500 font-normal">Completada</Badge>;
    case 'failed':
      return <Badge variant="destructive" className="font-normal">Fallida</Badge>;
    case 'busy':
      return <Badge variant="outline" className="border-amber-500 text-amber-700 font-normal">Ocupado</Badge>;
    case 'no-answer':
      return <Badge variant="outline" className="border-blue-500 text-blue-700 font-normal">Sin respuesta</Badge>;
    default:
      return <Badge variant="secondary" className="font-normal">{status}</Badge>;
  }
};

// Enhanced function to get the best available phone number from a call log
export const getBestPhoneNumber = (log: VapiCallLog): string => {
  // First check primary fields that typically contain phone numbers
  if (log.customer_number) return formatPhoneNumber(log.customer_number);
  if (log.caller_phone_number) return formatPhoneNumber(log.caller_phone_number);
  if (log.phone_number) return formatPhoneNumber(log.phone_number);
  
  // If metadata exists and is an object, check for phone numbers there
  if (log.metadata && typeof log.metadata === 'object') {
    // Check common metadata fields for phone numbers
    const metadataObj = log.metadata as Record<string, any>;
    
    // Check common field names that might contain phone numbers
    const phoneFields = [
      'phoneNumber', 'customerNumber', 'customerPhoneNumber', 
      'callerNumber', 'recipientNumber', 'toNumber', 'fromNumber',
      'to', 'from', 'recipient', 'caller', 'customer_phone'
    ];
    
    for (const field of phoneFields) {
      if (metadataObj[field] && typeof metadataObj[field] === 'string') {
        return formatPhoneNumber(metadataObj[field]);
      }
    }
    
    // Look for any field that might contain a phone number pattern
    for (const [key, value] of Object.entries(metadataObj)) {
      if (
        typeof value === 'string' && 
        (value.match(/^\+?[0-9\s\(\)\-]{7,}$/) || // Basic phone number pattern
         key.toLowerCase().includes('phone') || 
         key.toLowerCase().includes('number') ||
         key.toLowerCase().includes('tel'))
      ) {
        return formatPhoneNumber(value);
      }
    }
  }
  
  // Default fallback
  return 'Sin número';
};
