
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn, Users, LifeBuoy } from 'lucide-react';
import { useAuth } from '@/context/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

export const formatRole = (role: string) => {
  const displayRoles: Record<string, string> = {
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

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userData, signOut } = useAuth();
  
  if (!currentUser) {
    return (
      <Button onClick={() => navigate('/login')} variant="subtle" size="sm" className="shadow-none">
        <LogIn className="mr-2 h-4 w-4" />
        <span>Iniciar sesión</span>
      </Button>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 border border-slate-200">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={currentUser.photoURL || undefined} 
              alt={currentUser.displayName || "User"} 
            />
            <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">
              {currentUser.displayName 
                ? getInitials(currentUser.displayName) 
                : 'U'
              }
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {currentUser.displayName}
            </p>
            <p className="text-xs leading-none text-slate-500">
              {currentUser.email}
            </p>
            {userData && (
              <Badge variant="outline" className="mt-1 text-xs w-fit">
                {formatRole(userData.role)}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userData && ['admin', 'owner'].includes(userData.role) && (
          <>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate('/user-management')}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Gestión de Usuarios</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate('/admin-config')}
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Config</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => navigate('/support')}
        >
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Centro de Soporte</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-500 focus:text-red-500"
          onClick={signOut}
        >
          <LogIn className="mr-2 h-4 w-4 rotate-180" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
