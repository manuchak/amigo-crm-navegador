
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, UserCheck, UserCog, User, AlertTriangle, Monitor, Headset, Database } from 'lucide-react';
import { UserRole } from '@/types/auth';

interface UserRoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ 
  role, 
  size = 'md',
  showIcon = true
}) => {
  // Function to get badge variant based on role
  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'destructive';
      case 'supply_admin':
      case 'monitoring_supervisor':
      case 'bi':
        return 'secondary';
      case 'supply':
      case 'monitoring':
      case 'soporte':
        return 'outline';
      case 'pending':
        return 'warning';
      case 'unverified':
      default:
        return 'outline';
    }
  };
  
  // Function to get role display name
  const getRoleDisplayName = (role: string) => {
    const displayNames: Record<string, string> = {
      'unverified': 'No verificado',
      'pending': 'Pendiente',
      'supply': 'Supply',
      'supply_admin': 'Supply Admin',
      'soporte': 'Soporte',
      'bi': 'Business Intelligence',
      'monitoring': 'Monitoreo',
      'monitoring_supervisor': 'Supervisor Monitoreo',
      'admin': 'Administrador',
      'owner': 'Propietario'
    };
    return displayNames[role] || role;
  };
  
  // Function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Shield className="h-3.5 w-3.5 mr-1" />;
      case 'admin':
        return <Shield className="h-3.5 w-3.5 mr-1" />;
      case 'supply_admin':
        return <UserCog className="h-3.5 w-3.5 mr-1" />;
      case 'supply':
        return <UserCheck className="h-3.5 w-3.5 mr-1" />;
      case 'monitoring_supervisor':
        return <Monitor className="h-3.5 w-3.5 mr-1" />;
      case 'monitoring':
        return <Monitor className="h-3.5 w-3.5 mr-1" />;
      case 'soporte':
        return <Headset className="h-3.5 w-3.5 mr-1" />;
      case 'bi':
        return <Database className="h-3.5 w-3.5 mr-1" />;
      case 'pending':
        return <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
      case 'unverified':
      default:
        return <User className="h-3.5 w-3.5 mr-1" />;
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1'
  };
  
  return (
    <Badge 
      variant={getRoleVariant(role) as any} 
      className={`${sizeClasses[size]} font-medium flex items-center`}
    >
      {showIcon && getRoleIcon(role)}
      {getRoleDisplayName(role)}
    </Badge>
  );
};
