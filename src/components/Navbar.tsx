
import React from 'react';
import { Logo } from './navbar/Logo';
import { NavLinks } from './navbar/NavLinks';
import { UserMenu } from './navbar/UserMenu';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-white/80 backdrop-blur-lg border-b border-slate-100 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Logo />
        
        <div className="flex items-center space-x-2">
          <NavLinks />
          
          <div className="ml-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
