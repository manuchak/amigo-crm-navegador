
import { useState, useEffect } from 'react';

export interface Tweet {
  id: string;
  text: string;
  date: string;
}

export function useTwitterFeed(refreshInterval = 30) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [direction, setDirection] = useState<"left" | "right">("left");
  
  useEffect(() => {
    // Fetch tweets from API or use mock data
    const fetchTweets = () => {
      setIsLoading(true);
      
      // In a real implementation, this would be fetched from a backend API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockTweets: Tweet[] = [
          {
            id: "1",
            text: "⚠️ Bloqueo en carretera México-Puebla a la altura del km 85 por accidente. Se registran demoras de 45-60 min. #TráficoMX",
            date: "Hace 10 min"
          },
          {
            id: "2",
            text: "🌧️ Alerta por lluvia intensa en tramo San Martín-Puebla. Reduzca velocidad y aumente precaución. #ClimaMX",
            date: "Hace 25 min"
          },
          {
            id: "3",
            text: "⚠️ Manifestación bloquea Autopista México-Cuernavaca km 52. Se recomienda ruta alterna. #TráficoMX",
            date: "Hace 40 min"
          },
          {
            id: "4",
            text: "🌩️ Tormenta eléctrica severa en tramo Orizaba-Puebla. Precaución por visibilidad reducida. #ClimaMX",
            date: "Hace 55 min"
          },
          {
            id: "5",
            text: "⚠️ Cierre parcial en Autopista Arco Norte km 50 por accidente múltiple. Un carril habilitado. #TráficoMX",
            date: "Hace 1h"
          },
          {
            id: "6",
            text: "🌫️ Neblina densa en carretera Puebla-Tlaxcala. Reduzca velocidad y encienda luces bajas. #ClimaMX",
            date: "Hace 1h 15min"
          }
        ];
        
        setTweets(mockTweets);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchTweets();
    
    // Setup periodic refresh
    const intervalId = setInterval(fetchTweets, refreshInterval * 1000);
    
    // Setup direction change every 2 minutes (reduced frequency)
    const directionIntervalId = setInterval(() => {
      setDirection(prev => prev === "left" ? "right" : "left");
    }, 120000); // Changed from 30 seconds to 2 minutes
    
    return () => {
      clearInterval(intervalId);
      clearInterval(directionIntervalId);
    };
  }, [refreshInterval]);
  
  return { tweets, isLoading, error, direction };
}
