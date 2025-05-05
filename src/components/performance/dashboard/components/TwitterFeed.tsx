
import React from 'react';
import { Marquee } from '@/components/ui/marquee';
import { MessageSquareText } from 'lucide-react';

interface Tweet {
  id: string;
  text: string;
  date: string;
}

interface TwitterFeedProps {
  tweets: Tweet[];
  isLoading: boolean;
  error?: string;
}

export function TwitterFeed({ tweets, isLoading, error }: TwitterFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-border/40 rounded-md px-3 py-2 flex items-center mb-2">
        <MessageSquareText className="h-4 w-4 mr-2 text-blue-400" />
        <div className="text-xs">Cargando actualizaciones de CAPUFE...</div>
      </div>
    );
  }

  if (error || tweets.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-border/40 rounded-md px-3 py-2 flex items-center mb-2">
        <MessageSquareText className="h-4 w-4 mr-2 text-blue-400" />
        <div className="text-xs">
          {error || "No hay actualizaciones recientes de CAPUFE"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-border/40 rounded-md px-3 py-0 mb-2 overflow-hidden">
      <Marquee speed="normal" pauseOnHover direction="left">
        {tweets.map((tweet) => (
          <div key={tweet.id} className="flex items-center mr-8">
            <MessageSquareText className="h-3 w-3 mr-2 shrink-0 text-blue-400" />
            <span className="text-xs">{tweet.text}</span>
            <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{tweet.date}</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
