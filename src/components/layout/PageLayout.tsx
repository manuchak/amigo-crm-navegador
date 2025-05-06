
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth/AuthContext';
import { logPageAccess } from '@/context/auth/hooks/utils/userActions';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Registrar acceso a página cuando cambia la ruta
  useEffect(() => {
    if (currentUser?.uid) {
      logPageAccess(currentUser.uid, location.pathname);
    }
  }, [location.pathname, currentUser?.uid]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Navbar />
      <div className="pt-24 px-4">
        <div className="container mx-auto">
          {title && <h1 className="text-3xl font-bold mb-8">{title}</h1>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
