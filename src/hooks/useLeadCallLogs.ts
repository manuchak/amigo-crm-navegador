
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
        // Format phone number to ensure proper matching
        const formattedPhoneNumber = phoneNumber.trim().replace(/\D/g, '');
        
        // Use ILIKE to make the search case-insensitive and add wildcards
        // for partial matches with different phone number formats
        const { data, error } = await supabase
          .from('vapi_call_logs')
          .select('*')
          .or(`customer_number.ilike.%${formattedPhoneNumber}%,caller_phone_number.ilike.%${formattedPhoneNumber}%,phone_number.ilike.%${formattedPhoneNumber}%`)
          .order('start_time', { ascending: false });

        if (error) {
          throw error;
        }

        console.log('Call logs fetched for phone:', formattedPhoneNumber, 'Count:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('Sample call log:', data[0]);
        }

        setCallLogs(data || []);
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
