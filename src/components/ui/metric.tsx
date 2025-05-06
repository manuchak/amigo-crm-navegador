
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface MetricProps {
  title: string;
  value: number | string;
  trend?: string;
  trendType?: 'increase' | 'decrease' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

export function Metric({ 
  title, 
  value, 
  trend, 
  trendType = 'neutral', 
  icon: Icon, 
  className 
}: MetricProps) {
  const trendColorClass = {
    increase: 'text-red-600',
    decrease: 'text-green-600',
    neutral: 'text-gray-500'
  };

  return (
    <div className={cn("p-4 border rounded-lg bg-card", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground/70" />}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className={cn("text-sm font-medium flex items-center", trendColorClass[trendType])}>
            {trend}
            {trendType === 'increase' && (
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
              </svg>
            )}
            {trendType === 'decrease' && (
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
