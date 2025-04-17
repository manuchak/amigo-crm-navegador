
import React from 'react';
import { Clock } from 'lucide-react';
import { formatCallDuration } from './utils';

interface CallDurationProps {
  seconds: number | null;
  includeIcon?: boolean;
  className?: string;
}

export const CallDuration: React.FC<CallDurationProps> = ({
  seconds,
  includeIcon = true,
  className = ''
}) => {
  const duration = formatCallDuration(seconds);
  
  if (!seconds) return null;
  
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
      {includeIcon && <Clock className="w-3 h-3" />}
      {duration}
    </span>
  );
};
