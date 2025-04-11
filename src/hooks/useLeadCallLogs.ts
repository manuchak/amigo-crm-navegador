
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
        
        // Enhanced query to search in more places for phone numbers, prioritizing customer_number
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
          
          // Process call logs to ensure durations are handled correctly
          const processedLogs = data.map(log => {
            // If duration is missing but we have start and end times, calculate it
            if ((log.duration === null || log.duration === undefined) && log.start_time && log.end_time) {
              try {
                const startDate = new Date(log.start_time);
                const endDate = new Date(log.end_time);
                
                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                  // Calculate duration in seconds
                  log.duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
                  console.log(`Calculated duration from timestamps: ${log.duration}s`);
                }
              } catch (e) {
                console.error("Error calculating duration:", e);
              }
            }
            
            // Check if customer_number is null or empty
            if (!log.customer_number) {
              return {
                ...log,
                // Add the phone number to the customer_number field for display purposes
                customer_number: phoneNumber
              };
            }
            return log;
          });
          
          setCallLogs(processedLogs);
        } else {
          console.log('No call logs found, trying a broader search...');
          
          // Additional search in metadata fields to find phone numbers
          // Instead of using RPC function, use a direct query with a proper type check
          const { data: metadataLogs, error: metadataError } = await supabase
            .from('vapi_call_logs')
            .select('*')
            .or(`metadata->>'vapi_customer_number'.ilike.%${lastTenDigits}%,metadata->>'number'.ilike.%${lastTenDigits}%,metadata->>'phoneNumber'.ilike.%${lastTenDigits}%,metadata->>'customerNumber'.ilike.%${lastTenDigits}%`)
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
                
                // Process found logs to handle durations
                const processedLogs = lenientData.map(log => {
                  // Calculate duration if possible
                  if ((log.duration === null || log.duration === undefined) && log.start_time && log.end_time) {
                    try {
                      const startDate = new Date(log.start_time);
                      const endDate = new Date(log.end_time);
                      
                      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                        log.duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
                      }
                    } catch (e) {
                      console.error("Error calculating duration:", e);
                    }
                  }
                  
                  return {
                    ...log,
                    customer_number: log.customer_number || phoneNumber
                  };
                });
                
                setCallLogs(processedLogs);
                setLoading(false);
                return;
              }
            }
          } else if (metadataLogs && metadataLogs.length > 0) {
            console.log('Found logs with metadata search:', metadataLogs.length);
            
            // Process found logs to handle durations
            const processedLogs = metadataLogs.map(log => {
              // Calculate duration if possible
              if ((log.duration === null || log.duration === undefined) && log.start_time && log.end_time) {
                try {
                  const startDate = new Date(log.start_time);
                  const endDate = new Date(log.end_time);
                  
                  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    log.duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
                  }
                } catch (e) {
                  console.error("Error calculating duration:", e);
                }
              }
              
              return log;
            });
            
            setCallLogs(processedLogs);
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
