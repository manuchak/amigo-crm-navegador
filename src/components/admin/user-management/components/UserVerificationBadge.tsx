
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface UserVerificationBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const UserVerificationBadge: React.FC<UserVerificationBadgeProps> = ({ 
  isVerified, 
  size = 'md' 
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1'
  };
  
  if (isVerified) {
    return (
      <Badge variant="success" className={`${sizeClasses[size]} bg-green-100 text-green-800 flex items-center gap-1`}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Verificado</span>
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className={`${sizeClasses[size]} bg-amber-100 text-amber-800 flex items-center gap-1`}>
      <XCircle className="h-3.5 w-3.5" />
      <span>No verificado</span>
    </Badge>
  );
};
