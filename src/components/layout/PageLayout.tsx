
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title,
  loading = false 
}) => {
  const location = useLocation();
  const { currentUser, loading: authLoading } = useAuth();
  
  // Debug logging
  useEffect(() => {
    console.log("PageLayout rendering", { 
      path: location.pathname,
      user: currentUser?.email,
      authLoading,
      contentLoading: loading
    });
  }, [location.pathname, currentUser, authLoading, loading]);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Navbar />
      <div className="pt-24 px-4">
        <div className="container mx-auto">
          {title && (
            <div className="mb-8">
              {authLoading ? (
                <Skeleton className="h-10 w-64" />
              ) : (
                <h1 className="text-3xl font-bold">{title}</h1>
              )}
            </div>
          )}
          
          {authLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
