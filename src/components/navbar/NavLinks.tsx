
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export const NavLinks: React.FC = () => {
  const location = useLocation();
  const { currentUser, userData } = useAuth();
  
  const getNavItems = () => {
    const items = [
      { name: 'Inicio', path: '/' }
    ];
    
    if (currentUser && userData) {
      items.push({ name: 'Dashboard', path: '/dashboard' });
      
      // Admin y Owner tienen acceso a todo
      if (['admin', 'owner'].includes(userData.role)) {
        items.push({ name: 'Performance', path: '/performance' });
        items.push({ name: 'Servicios Activos', path: '/active-services' });
        items.push({ name: 'Leads', path: '/leads' });
        items.push({ name: 'Requerimientos', path: '/requerimientos' });
        items.push({ name: 'Instalación GPS', path: '/instalacion-gps' });
        items.push({ name: 'Soporte', path: '/support' });
      } else {
        // Para otros roles, añadir según sus permisos específicos
        if (['atención_afiliado', 'supply', 'supply_admin', 'afiliados'].includes(userData.role)) {
          items.push({ name: 'Leads', path: '/leads' });
        }
        
        if (['supply', 'supply_admin'].includes(userData.role)) {
          items.push({ name: 'Requerimientos', path: '/requerimientos' });
        }
        
        if (['atención_afiliado'].includes(userData.role)) {
          items.push({ name: 'Soporte', path: '/support' });
        }
      }
    }
    
    return items;
  };
  
  const navItems = getNavItems();
  
  return (
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
  );
};
