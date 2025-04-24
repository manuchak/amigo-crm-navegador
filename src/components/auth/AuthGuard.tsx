
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { user, loading, refreshSession } = useAuth();
  const location = useLocation();
  const { hasPermission } = useRolePermissions();
  const [hasPageAccess, setHasPageAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  // Extract page ID from the current path
  const pageId = location.pathname.split('/')[1] || 'dashboard';
  
  // Function to handle session refresh when needed
  const handleRefreshSession = async () => {
    setRetryCount(prev => prev + 1);
    const success = await refreshSession();
    if (success) {
      checkAccess();
    }
  };
  
  // Function to check if user has access to this page
  const checkAccess = async () => {
    setCheckingAccess(true);
    
    try {
      // No permission check needed for the auth page
      if (pageId === 'auth') {
        setHasPageAccess(true);
        setCheckingAccess(false);
        return;
      }
      
      if (!user) {
        console.log('No user found, denying access');
        setHasPageAccess(false);
        return;
      }
      
      // Check if the user has permission to access this page
      const canAccess = await hasPermission('page', pageId);
      console.log(`Permission check for ${pageId}: ${canAccess}`);
      setHasPageAccess(canAccess);
    } catch (error) {
      console.error('Error checking page access:', error);
      // Default to allow access if there's an error checking permissions
      // to prevent users from being locked out
      setHasPageAccess(true);
    } finally {
      setCheckingAccess(false);
    }
  };
  
  // Check access when user, loading state, pageId or retry count changes
  useEffect(() => {
    if (!loading) {
      checkAccess();
    }
  }, [user, loading, pageId, retryCount]);
  
  if (loading || checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login page with return URL
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  if (hasPageAccess === false) {
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
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
            >
              Volver al Dashboard
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
  
  // User is authenticated and has access to the page
  return <>{children}</>;
};

export default AuthGuard;
