
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { TwitterFeed } from './TwitterFeed';
import { useTwitterFeed } from '../hooks/useTwitterFeed';

export function MapHeader() {
  const { tweets, isLoading, error } = useTwitterFeed();
  const [direction, setDirection] = useState<"left" | "right">("left");
  
  // Cambia la dirección cada 30 segundos para simular efecto de ticker financiero
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDirection(prev => prev === "left" ? "right" : "left");
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <TwitterFeed tweets={tweets} isLoading={isLoading} error={error} />
      
      <div className="flex justify-between items-center bg-white rounded-lg border p-3 mb-2 shadow-sm">
        <div>
          <h3 className="text-sm font-medium">Servicios activos en ruta</h3>
          <p className="text-xs text-muted-foreground">
            Rutas en tiempo real basadas en carreteras
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-slate-50 px-2 py-1 rounded">
          <MapPin className="h-3 w-3" />
          <span>Actualizado hace 5 mins</span>
        </div>
      </div>
    </>
  );
}
