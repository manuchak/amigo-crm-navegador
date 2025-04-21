
import { useState, useEffect } from 'react';
import { getProspects, getProspectsByStatus, Prospect } from '@/services/prospectService';
import { useToast } from '@/hooks/use-toast';

export function useProspects(status?: string) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProspects = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching prospects with status filter:", status);
      const data = status 
        ? await getProspectsByStatus(status)
        : await getProspects();
      console.log(`Fetched ${data.length} prospects`);
      
      // Log some of the first prospects to help with debugging
      if (data.length > 0) {
        console.log("Sample prospect data:", data[0]);
      }
      
      setProspects(data);
    } catch (err: any) {
      console.error('Error fetching prospects:', err);
      const errorMessage = err.message || 'No se pudieron cargar los prospectos';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, [status]);

  return { prospects, loading, error, refetch: fetchProspects };
}
