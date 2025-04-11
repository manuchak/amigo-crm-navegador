
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VapiCallLog } from '@/components/leads/types';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneForSearch } from './phoneFormatUtils';
import { 
  queryCallLogsByPhoneNumber, 
  queryCallLogsByMetadata, 
  queryCallLogsByLenientMatch 
} from './callLogsQueries';
import { processCallLogs } from './callLogsProcessor';

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
        // Format phone number for searching
        const { formattedNumber, lastTenDigits, lastSevenDigits } = formatPhoneForSearch(phoneNumber);
        
        if (!formattedNumber || !lastTenDigits) {
          setCallLogs([]);
          setLoading(false);
          return;
        }
        
        // First attempt: search in main phone number fields
        const { data, error } = await queryCallLogsByPhoneNumber(supabase, formattedNumber, lastTenDigits);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          console.log('Call logs fetched, count:', data.length);
          setCallLogs(processCallLogs(data, phoneNumber));
        } else {
          console.log('No call logs found, trying metadata search...');
          
          // Second attempt: search in metadata fields
          const { data: metadataLogs, error: metadataError } = await queryCallLogsByMetadata(
            supabase, 
            lastTenDigits
          );
            
          if (metadataError) {
            console.error('Error in metadata search:', metadataError);
            
            // Third attempt: more lenient search with last 7 digits
            if (lastSevenDigits) {
              const { data: lenientData, error: lenientError } = await queryCallLogsByLenientMatch(
                supabase, 
                lastSevenDigits
              );
                
              if (lenientError) {
                console.error('Error in lenient search:', lenientError);
                setCallLogs([]);
              } else if (lenientData && lenientData.length > 0) {
                console.log('Found logs with lenient search:', lenientData.length);
                setCallLogs(processCallLogs(lenientData, phoneNumber));
              } else {
                setCallLogs([]);
              }
            } else {
              setCallLogs([]);
            }
          } else if (metadataLogs && metadataLogs.length > 0) {
            console.log('Found logs with metadata search:', metadataLogs.length);
            setCallLogs(processCallLogs(metadataLogs, phoneNumber));
          } else {
            setCallLogs([]);
          }
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
