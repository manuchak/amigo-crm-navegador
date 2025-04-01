
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth';

interface RoleBadgeProps {
  role: UserRole;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const formatRole = (role: UserRole) => {
    const displayRoles = {
      'unverified': 'No verificado',
      'pending': 'Pendiente',
      'atención_afiliado': 'Atención al Afiliado',
      'supply': 'Supply',
      'supply_admin': 'Supply Admin',
      'afiliados': 'Afiliados',
      'admin': 'Administrador',
      'owner': 'Propietario'
    };
    
    return displayRoles[role] || role;
  };
  
  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      'unverified': 'bg-gray-200 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'atención_afiliado': 'bg-blue-100 text-blue-800',
      'supply': 'bg-green-100 text-green-800',
      'supply_admin': 'bg-emerald-100 text-emerald-800',
      'afiliados': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800',
      'owner': 'bg-slate-800 text-white'
    };
    
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Badge className={`${getRoleBadgeColor(role)}`}>
      {formatRole(role)}
    </Badge>
  );
};

export default RoleBadge;
