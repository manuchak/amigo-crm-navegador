
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Shield, CheckCircle } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Leads', path: '/leads' },
    { name: 'Requerimientos', path: '/requerimientos' }
  ];
  
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
      </div>
    </nav>
  );
};

export default Navbar;
