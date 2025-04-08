
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
        // Query the vapi_call_logs table for records matching this phone number
        const { data, error } = await supabase
          .from('vapi_call_logs')
          .select('*')
          .or(`caller_phone_number.eq.${phoneNumber},phone_number.eq.${phoneNumber},customer_number.eq.${phoneNumber}`)
          .order('start_time', { ascending: false });

        if (error) {
          throw error;
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
