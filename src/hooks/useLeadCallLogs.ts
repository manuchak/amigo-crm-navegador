
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VapiCallLog } from '@/components/leads/types';
import { useToast } from '@/hooks/use-toast';

export function useLeadCallLogs(leadId: number | null, phoneNumber: string | null) {
  const [callLogs, setCallLogs] = useState<VapiCallLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!leadId || !phoneNumber) {
      setCallLogs([]);
      return;
    }

    async function fetchCallLogs() {
      setLoading(true);
      try {
        // Format phone number to ensure proper matching - extract only digits
        const formattedPhoneNumber = phoneNumber.trim().replace(/\D/g, '');
        
        // If the phone number is very short (less than 7 digits), it's likely invalid
        if (formattedPhoneNumber.length < 7) {
          console.warn('Phone number too short, might be invalid:', phoneNumber);
          setCallLogs([]);
          setLoading(false);
          return;
        }
        
        // Use the last 10 digits for matching (ignoring country code differences)
        const lastTenDigits = formattedPhoneNumber.slice(-10);
        console.log('Searching for calls with phone digits:', lastTenDigits);
        
        // Enhanced query to search in more places for phone numbers, including metadata
        const { data, error } = await supabase
          .from('vapi_call_logs')
          .select('*')
          .or(`customer_number.ilike.%${formattedPhoneNumber}%,customer_number.ilike.%${lastTenDigits}%,caller_phone_number.ilike.%${formattedPhoneNumber}%,caller_phone_number.ilike.%${lastTenDigits}%,phone_number.ilike.%${formattedPhoneNumber}%,phone_number.ilike.%${lastTenDigits}%`)
          .order('start_time', { ascending: false });

        if (error) {
          throw error;
        }

        console.log('Call logs fetched for phone:', formattedPhoneNumber, 'Last 10 digits:', lastTenDigits, 'Count:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('Sample call log:', data[0]);
          
          // If we have call logs, try to update any null phone numbers with the lead's phone number
          // This helps with display in the UI even if the database has nulls
          const enhancedLogs = data.map(log => {
            // Only add the phone number if all phone fields are null
            if (!log.customer_number && !log.caller_phone_number && !log.phone_number) {
              return {
                ...log,
                // Add the phone number to one of the fields for display purposes
                customer_number: phoneNumber
              };
            }
            return log;
          });
          
          setCallLogs(enhancedLogs);
        } else {
          console.log('No call logs found, trying a broader search...');
          
          // Additional search in metadata fields to find phone numbers
          // Instead of using RPC function, use a direct query with a proper type check
          const { data: metadataLogs, error: metadataError } = await supabase
            .from('vapi_call_logs')
            .select('*')
            .or(`metadata->>'number'.ilike.%${lastTenDigits}%,metadata->>'phoneNumber'.ilike.%${lastTenDigits}%,metadata->>'customerNumber'.ilike.%${lastTenDigits}%`)
            .order('start_time', { ascending: false });
            
          if (metadataError) {
            console.error('Error in metadata search:', metadataError);
            
            // If that fails, try a more lenient search with just the last 7 digits
            if (lastTenDigits.length >= 7) {
              const lastSevenDigits = lastTenDigits.slice(-7);
              
              const { data: lenientData, error: lenientError } = await supabase
                .from('vapi_call_logs')
                .select('*')
                .or(`customer_number.ilike.%${lastSevenDigits}%,caller_phone_number.ilike.%${lastSevenDigits}%,phone_number.ilike.%${lastSevenDigits}%`)
                .order('start_time', { ascending: false });
                
              if (lenientError) {
                console.error('Error in lenient search:', lenientError);
              } else if (lenientData && lenientData.length > 0) {
                console.log('Found logs with lenient search:', lenientData.length);
                
                // Add the lead's phone number to the logs for display
                const enhancedLogs = lenientData.map(log => ({
                  ...log,
                  customer_number: log.customer_number || phoneNumber
                }));
                
                setCallLogs(enhancedLogs);
                setLoading(false);
                return;
              }
            }
          } else if (metadataLogs && metadataLogs.length > 0) {
            console.log('Found logs with metadata search:', metadataLogs.length);
            setCallLogs(metadataLogs);
            setLoading(false);
            return;
          }
          
          setCallLogs([]);
        }
      } catch (error) {
        console.error('Error fetching call logs:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los registros de llamadas",
          variant: "destructive",
        });
        setCallLogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCallLogs();
  }, [leadId, phoneNumber, toast]);

  return { callLogs, loading };
}
