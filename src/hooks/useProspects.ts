
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
      const data = status 
        ? await getProspectsByStatus(status)
        : await getProspects();
      setProspects(data);
    } catch (err) {
      console.error('Error fetching prospects:', err);
      setError('No se pudieron cargar los prospectos');
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de prospectos",
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
