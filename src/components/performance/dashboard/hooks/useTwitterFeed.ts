
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Tweet interface
export interface Tweet {
  id: string;
  text: string;
  date: string;
}

export function useTwitterFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchTwitterData = async () => {
      try {
        setIsLoading(true);
        
        // Call the Supabase edge function
        const { data, error } = await supabase.functions.invoke('fetch-twitter-feed');
        
        if (error) {
          throw new Error(`Error invoking function: ${error.message}`);
        }
        
        if (data && data.tweets) {
          setTweets(data.tweets);
          setError(undefined);
        } else {
          throw new Error('No tweets data received');
        }
      } catch (err) {
        console.error('Error fetching Twitter data:', err);
        setError('No se pudieron cargar las actualizaciones de CAPUFE');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTwitterData();

    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchTwitterData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return { tweets, isLoading, error };
}
