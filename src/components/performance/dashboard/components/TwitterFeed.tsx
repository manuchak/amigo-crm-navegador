
import React from 'react';
import { Marquee } from '@/components/ui/marquee';
import { Tweet } from '../hooks/useTwitterFeed';
import { AlertTriangle, MapPin, Route, CloudRain, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TwitterFeedProps {
  tweets: Tweet[];
  isLoading: boolean;
  error?: string;
  direction?: "left" | "right";
}

export function TwitterFeed({ tweets, isLoading, error, direction = "left" }: TwitterFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-2 mb-2 shadow-sm h-11 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-3 w-3 bg-blue-200 rounded-full"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || tweets.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-2 mb-2 shadow-sm h-11">
        <div className="flex items-center justify-center gap-2 text-xs text-red-500">
          <AlertTriangle size={14} />
          <span>{error || "No hay actualizaciones disponibles"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-2 mb-2 shadow-sm h-11 overflow-hidden">
      <div className="flex items-center gap-1.5 mr-2 h-full z-10 relative bg-white pr-2">
        <div className="bg-blue-50 p-0.5 rounded-full">
          <Route size={14} className="text-blue-500" />
        </div>
        <h3 className="text-xs font-medium whitespace-nowrap">Alertas de Ruta</h3>
      </div>
      
      <div className="absolute top-2 left-[120px] right-2 h-7">
        <Marquee pauseOnHover direction={direction} speed="slow" className="py-0 h-7">
          {tweets.map((tweet) => {
            // Determine tweet type and styling based on content
            const isRoadBlock = tweet.text.toLowerCase().includes('bloqueo') || tweet.text.toLowerCase().includes('cierre');
            const isWeather = tweet.text.toLowerCase().includes('lluvia') || tweet.text.toLowerCase().includes('tormenta') || tweet.text.toLowerCase().includes('clima');
            
            let bgColor = 'bg-blue-50/50';
            let borderColor = 'border-blue-100';
            let icon = <MapPin size={12} className="text-blue-500" />;
            
            if (isRoadBlock) {
              bgColor = 'bg-red-50/50';
              borderColor = 'border-red-100';
              icon = <ArrowDown size={12} className="text-red-500" />;
            } else if (isWeather) {
              bgColor = 'bg-amber-50/50';
              borderColor = 'border-amber-100';
              icon = <CloudRain size={12} className="text-amber-500" />;
            }
            
            return (
              <div 
                key={tweet.id}
                className={cn(
                  "flex items-center gap-2 mx-3 px-2 py-1 rounded-md border min-w-max",
                  bgColor,
                  borderColor
                )}
              >
                {icon}
                <span className="text-xs font-medium text-slate-700 truncate max-w-xs">{tweet.text}</span>
                <span className="text-xs text-slate-500 whitespace-nowrap">{tweet.date}</span>
              </div>
            );
          })}
        </Marquee>
      </div>
    </div>
  );
}
