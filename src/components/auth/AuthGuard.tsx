
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { currentUser, loading, refreshUserData } = useAuth();
  const location = useLocation();
  const [verificationState, setVerificationState] = useState<'pending' | 'verified' | 'denied'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  
  // Get the page ID from the URL
  const pageId = location.pathname.split('/')[1] || 'dashboard';
  
  // Handle session refresh without re-entering verification loop
  const handleRefreshSession = async () => {
    try {
      setError(null);
      setRefreshAttempts(prev => prev + 1);
      await refreshUserData();
      // Reset verification state to trigger re-evaluation
      setVerificationState('pending');
    } catch (error: any) {
      console.error('Error refreshing session:', error);
      setError(error.message || 'Error refreshing session');
    }
  };

  // Effect to check access permissions once loading is complete
  useEffect(() => {
    // Only process if we're still pending and not loading
    if (verificationState !== 'pending' || loading) {
      return;
    }
    
    console.log('AuthGuard checking access: Page:', pageId, 'User:', !!currentUser, 'Role:', currentUser?.role);
    
    // Public pages are always accessible
    const publicPages = ['auth', 'login', '', 'inicio'];
    if (publicPages.includes(pageId)) {
      setVerificationState('verified');
      return;
    }
    
    // If no user, deny access to protected pages
    if (!currentUser) {
      setVerificationState('denied');
      return;
    }
    
    // If user is authenticated, grant access to all pages
    setVerificationState('verified');
    
  }, [currentUser, loading, pageId, verificationState, refreshAttempts]);
  
  // Show loading state while checking
  if (loading || verificationState === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acceso...</p>
          {refreshAttempts > 0 && <p className="text-xs text-muted-foreground">Intentos: {refreshAttempts}</p>}
        </div>
      </div>
    );
  }
  
  // If no user, redirect to auth page (only for protected pages)
  if (verificationState === 'denied' && !currentUser) {
    // Don't redirect if we're already on auth or login
    if (['auth', 'login', ''].includes(location.pathname.split('/')[1])) {
      return <>{children}</>;
    }
    console.log("Redirecting to /auth because no user is authenticated");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // If access is denied based on role
  if (verificationState === 'denied') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2 max-w-md text-center p-8">
          <div className="rounded-full bg-red-100 p-3 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-600"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Acceso Denegado</h2>
          <p className="text-muted-foreground mt-2">
            No tienes permisos para acceder a esta página. Contacta con un administrador si crees que deberías tener acceso.
          </p>
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm mt-4">
              {error}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              Volver al Inicio
            </Button>
            <Button
              onClick={handleRefreshSession}
              variant="default"
            >
              Actualizar permisos
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Access is verified, render the children
  return <>{children}</>;
};

export default AuthGuard;
