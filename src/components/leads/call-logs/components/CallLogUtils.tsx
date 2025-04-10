
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
  // Try to extract data from metadata for most reliable phone info
  if (log.metadata && typeof log.metadata === 'object') {
    // First check for specific number fields that VAPI mentioned
    const metadataObj = log.metadata as Record<string, any>;
    
    // Look for the VAPI format described in the schema
    if (metadataObj.number && typeof metadataObj.number === 'string') {
      return formatPhoneNumber(metadataObj.number);
    }
    
    if (metadataObj.phoneNumber && typeof metadataObj.phoneNumber === 'string') {
      return formatPhoneNumber(metadataObj.phoneNumber);
    }
    
    // Look inside fallbackDestination if it exists
    if (metadataObj.fallbackDestination && typeof metadataObj.fallbackDestination === 'object') {
      if (metadataObj.fallbackDestination.number) {
        return formatPhoneNumber(metadataObj.fallbackDestination.number);
      }
    }
    
    // Check other common field names for phone numbers
    const phoneFields = [
      'customerNumber', 'customerPhoneNumber', 'callerNumber',
      'toNumber', 'fromNumber', 'recipientNumber', 'customer_phone'
    ];
    
    for (const field of phoneFields) {
      if (metadataObj[field] && typeof metadataObj[field] === 'string') {
        return formatPhoneNumber(metadataObj[field]);
      }
    }
  }
  
  // Check primary fields in the call log object
  if (log.customer_number) return formatPhoneNumber(log.customer_number);
  if (log.caller_phone_number) return formatPhoneNumber(log.caller_phone_number);
  if (log.phone_number) return formatPhoneNumber(log.phone_number);
  
  // Default fallback
  return 'Sin número';
};
