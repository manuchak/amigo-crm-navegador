
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  isDelayed?: boolean;
  hasBlockage?: boolean;
}

export function ProgressBar({ progress, isDelayed, hasBlockage }: ProgressBarProps) {
  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span className="text-xs font-semibold inline-block text-slate-600">
            Progreso de entrega
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block text-slate-600">
            {progress}%
          </span>
        </div>
      </div>
      <div className="flex h-2 mb-4 overflow-hidden rounded bg-gray-200">
        <div
          style={{ width: `${progress}%` }}
          className={cn(
            "flex flex-col justify-center rounded text-center text-white text-xs transition-all duration-500",
            hasBlockage ? "bg-red-500" : isDelayed ? "bg-amber-500" : "bg-green-500"
          )}
        ></div>
      </div>
      
      {/* Display blockage indicator if applicable */}
      {hasBlockage && (
        <div 
          className="absolute h-6 w-6 bg-red-100 rounded-full flex items-center justify-center border-2 border-white transform -translate-y-[16px]"
          style={{ left: `calc(${progress}% - 12px)` }}
        >
          <AlertTriangle className="h-3 w-3 text-red-500" />
        </div>
      )}
      
      {/* Origin and destination labels */}
      <div className="flex justify-between text-xs text-slate-500">
        <span>Origen</span>
        <span>Destino</span>
      </div>
    </div>
  );
}
