
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Shield, LogIn, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userData, signOut } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const formatRole = (role: string) => {
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
  
  const getNavItems = () => {
    const items = [
      { name: 'Inicio', path: '/' }
    ];
    
    if (currentUser && userData) {
      items.push({ name: 'Dashboard', path: '/dashboard' });
      
      if (['atención_afiliado', 'admin', 'owner'].includes(userData.role)) {
        items.push({ name: 'Leads', path: '/leads' });
      }
      
      if (['supply', 'supply_admin', 'admin', 'owner'].includes(userData.role)) {
        items.push({ name: 'Requerimientos', path: '/requerimientos' });
      }
      
      if (['admin', 'owner'].includes(userData.role)) {
        items.push({ name: 'Administración', path: '/admin-config' });
      }
    }
    
    return items;
  };
  
  const navItems = getNavItems();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-white/80 backdrop-blur-lg border-b border-slate-100 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="font-medium text-lg tracking-tight flex items-center gap-2"
        >
          <div className="bg-primary rounded-full p-1.5 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="flex flex-col items-start">
            <span className="font-semibold text-slate-800">CustodiosCRM</span>
            <span className="text-xs text-slate-400">by Detecta</span>
          </span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-colors",
                  location.pathname === item.path
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="ml-4">
            {currentUser ? (
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
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-500 focus:text-red-500"
                    onClick={signOut}
                  >
                    <LogIn className="mr-2 h-4 w-4 rotate-180" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/login')} variant="subtle" size="sm" className="shadow-none">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Iniciar sesión</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
