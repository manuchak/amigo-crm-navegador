
import React from 'react';
import { 
  CheckCircle2, 
  PhoneOff, 
  PhoneMissed, 
  AlertCircle, 
  PhoneCall 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallStatusBadgeProps {
  status: string;
  className?: string;
}

export const CallStatusBadge: React.FC<CallStatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  // Normalize the status to handle various formats
  const normalizedStatus = status.toLowerCase();

  // Define badge configurations based on status
  const getBadgeConfig = () => {
    if (normalizedStatus.includes('complete')) {
      return {
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
        text: 'Completada',
        classes: 'bg-green-50 text-green-700 border-green-200'
      };
    }
    
    if (normalizedStatus.includes('no-answer') || normalizedStatus.includes('no answer')) {
      return {
        icon: <PhoneOff className="h-3 w-3 mr-1" />,
        text: 'Sin respuesta',
        classes: 'bg-orange-50 text-orange-700 border-orange-200'
      };
    }
    
    if (normalizedStatus.includes('busy') || normalizedStatus.includes('ocupado')) {
      return {
        icon: <PhoneMissed className="h-3 w-3 mr-1" />,
        text: 'Ocupado',
        classes: 'bg-yellow-50 text-yellow-700 border-yellow-200'
      };
    }
    
    if (normalizedStatus.includes('fail')) {
      return {
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        text: 'Fallida',
        classes: 'bg-red-50 text-red-700 border-red-200'
      };
    }
    
    // Default case
    return {
      icon: <PhoneCall className="h-3 w-3 mr-1" />,
      text: status,
      classes: 'bg-slate-50 text-slate-700 border-slate-200'
    };
  };
  
  const badgeConfig = getBadgeConfig();
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border",
        badgeConfig.classes,
        className
      )}
    >
      {badgeConfig.icon}
      {badgeConfig.text}
    </span>
  );
};
