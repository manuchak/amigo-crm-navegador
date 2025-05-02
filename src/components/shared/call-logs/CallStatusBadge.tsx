
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, PhoneOff, Phone, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallStatusBadgeProps {
  status: string | null;
  className?: string;
}

export const CallStatusBadge: React.FC<CallStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  if (!status) return null;
  
  const getStatusConfig = (status: string) => {
    const lowStatus = status.toLowerCase();
    
    switch (lowStatus) {
      case 'completed':
        return {
          label: 'Completada',
          variant: 'success',
          icon: Check,
          className: 'bg-green-500'
        };
      case 'failed':
        return {
          label: 'Fallida',
          variant: 'destructive',
          icon: PhoneOff,
          className: 'bg-red-500'
        };
      case 'ongoing':
        return {
          label: 'En curso',
          variant: 'default',
          icon: Phone,
          className: 'bg-blue-500'
        };
      case 'no-answer':
      case 'unknown':
        return {
          label: 'Sin respuesta',
          variant: 'outline',
          icon: Clock,
          className: 'border-amber-500 text-amber-700'
        };
      case 'busy':
        return {
          label: 'Ocupado',
          variant: 'outline',
          icon: Phone,
          className: 'border-yellow-500 text-yellow-700'
        };
      default:
        return {
          label: status,
          variant: 'secondary',
          icon: Phone,
          className: ''
        };
    }
  };
  
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant as any}
      className={cn(config.className, className)}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};
