
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
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Format role display
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
  
  // Only show certain nav items based on user role
  const getNavItems = () => {
    // Default items for all authenticated users
    const items = [
      { name: 'Inicio', path: '/' }
    ];
    
    // Logged in users
    if (currentUser && userData) {
      items.push({ name: 'Dashboard', path: '/dashboard' });
      
      // Based on roles
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
    <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="font-semibold text-xl tracking-tight flex items-center gap-2"
        >
          <div className="bg-gradient-to-br from-primary to-accent rounded-full p-1.5 flex items-center justify-center">
            <Shield size={20} className="text-primary-foreground" />
          </div>
          <span className="flex flex-col items-start">
            <span className="font-bold text-primary">CustodiosCRM</span>
            <span className="text-xs text-muted-foreground">by Detecta</span>
          </span>
        </Link>
        
        <div className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 rounded-full transition-all-medium",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div>
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={currentUser.photoURL || undefined} 
                      alt={currentUser.displayName || "User"} 
                    />
                    <AvatarFallback>
                      {currentUser.displayName 
                        ? getInitials(currentUser.displayName) 
                        : 'U'
                      }
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
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
                  className="cursor-pointer"
                  onClick={signOut}
                >
                  <LogIn className="mr-2 h-4 w-4 rotate-180" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/login')} variant="default">
              <LogIn className="mr-2 h-4 w-4" />
              <span>Iniciar sesión</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
