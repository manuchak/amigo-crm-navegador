
import React from 'react';
import { Marquee } from '@/components/ui/marquee';
import { Tweet } from '../hooks/useTwitterFeed';
import { AlertCircle, Twitter } from 'lucide-react';

interface TwitterFeedProps {
  tweets: Tweet[];
  isLoading: boolean;
  error?: string;
  direction?: "left" | "right";
}

export function TwitterFeed({ tweets, isLoading, error, direction = "left" }: TwitterFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-3 mb-2 shadow-sm h-12 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-4 w-4 bg-blue-200 rounded-full"></div>
          <div className="h-4 w-36 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || tweets.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-3 mb-2 shadow-sm">
        <div className="flex items-center justify-center gap-2 text-sm text-red-500">
          <AlertCircle size={16} />
          <span>{error || "No hay actualizaciones disponibles"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-3 mb-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-blue-50 p-1 rounded-full">
          <Twitter size={16} className="text-blue-500" />
        </div>
        <h3 className="text-sm font-medium">Actualizaciones CAPUFE</h3>
      </div>
      
      <Marquee pauseOnHover direction={direction} speed="normal" className="py-0">
        {tweets.map((tweet) => (
          <div 
            key={tweet.id}
            className="flex items-center gap-3 mx-4 px-3 py-1.5 rounded-lg bg-blue-50/50 border border-blue-100 min-w-max"
          >
            <span className="text-sm font-medium text-slate-700">{tweet.text}</span>
            <span className="text-xs text-slate-500 whitespace-nowrap">{tweet.date}</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
