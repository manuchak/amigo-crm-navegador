
import { useState, useEffect } from 'react';

// Mock data to simulate Twitter feed
const MOCK_TWEETS = [
  {
    id: '1',
    text: '⚠️ #CAPUFE informa: Cierre parcial en la autopista México-Puebla por mantenimiento preventivo.',
    date: 'Hace 30 min'
  },
  {
    id: '2',
    text: '🚧 Obras de mantenimiento en el km 32 de la carretera Querétaro-Irapuato. Precaución al conducir.',
    date: 'Hace 2 horas'
  },
  {
    id: '3',
    text: '📢 Flujo vehicular intenso en la México-Cuernavaca. Tome previsiones y tiempo adicional para su viaje.',
    date: 'Hace 3 horas'
  },
  {
    id: '4',
    text: '⛅ Neblina densa reduce visibilidad en autopista Puebla-Veracruz. Conduzca con precaución.',
    date: 'Hace 5 horas'
  }
];

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
        // In a real implementation, this would be an API call to get tweets
        // For now, simulate API delay and use mock data
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate successful data fetch
        setTweets(MOCK_TWEETS);
        setError(undefined);
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
