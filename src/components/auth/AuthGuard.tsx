
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
  const [hasPageAccess, setHasPageAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const pageId = location.pathname.split('/')[1] || 'dashboard';
  
  // Handle session refresh without triggering a new access check cycle
  const handleRefreshSession = async () => {
    setRetryCount(prev => prev + 1);
    try {
      await refreshUserData();
      // We don't set checkingAccess back to true here to prevent the loop
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };
  
  // Function to determine if a role has access to a specific page
  const checkRoleAccess = (role: UserRole, page: string): boolean => {
    switch (role) {
      case 'admin':
      case 'owner':
        return true;
      case 'afiliados':
        return ['dashboard', 'leads', 'prospects'].includes(page);
      case 'supply':
      case 'supply_admin':
        return ['dashboard', 'leads', 'validation'].includes(page);
      case 'atención_afiliado':
        return ['dashboard', 'support'].includes(page);
      case 'pending':
      case 'unverified':
        return ['dashboard'].includes(page);
      default:
        return false;
    }
  };
  
  // Single effect to check access permissions
  useEffect(() => {
    let isMounted = true;
    
    console.log('AuthGuard effect running. Loading:', loading, 'CurrentUser:', !!currentUser);
    
    // Function to check access permissions
    const checkAccess = () => {
      if (!isMounted) return;
      
      try {
        console.log('Checking access for page:', pageId);
        setError(null);
        
        // Always allow access to auth pages
        if (pageId === 'auth' || pageId === 'login') {
          console.log('Auth page detected, allowing access');
          setHasPageAccess(true);
          setCheckingAccess(false);
          return;
        }
        
        // If no user, deny access
        if (!currentUser) {
          console.log('No user found, denying access');
          setHasPageAccess(false);
          setCheckingAccess(false);
          return;
        }
        
        // Admin and owner always have full access
        if (currentUser.role === 'admin' || currentUser.role === 'owner') {
          console.log('Admin/Owner detected, granting access');
          setHasPageAccess(true);
          setCheckingAccess(false);
          return;
        }
        
        // Check role-based access for the current page
        const hasAccess = checkRoleAccess(currentUser.role, pageId);
        console.log(`Permission for ${pageId}: ${hasAccess ? 'Granted ✅' : 'Denied ❌'}`);
        setHasPageAccess(hasAccess);
        setCheckingAccess(false);
        
      } catch (error: any) {
        console.error('Error checking page access:', error);
        setError(error.message || 'Error al verificar permisos');
        
        // Fallback to grant access to admins/owners even if there's an error
        setHasPageAccess(currentUser?.role === 'admin' || currentUser?.role === 'owner');
        setCheckingAccess(false);
      }
    };
    
    // Only check access when loading is complete
    if (!loading) {
      checkAccess();
    }
    
    return () => {
      isMounted = false;
    };
  }, [currentUser, loading, pageId, retryCount]); // Only re-run when these dependencies change
  
  // Show loading state while checking
  if (loading || checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acceso...</p>
          {retryCount > 1 && (
            <Button
              onClick={handleRefreshSession}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // If no user, redirect to auth page
  if (!currentUser) {
    // Do not redirect if we're already on the auth or login page
    if (location.pathname === '/auth' || location.pathname === '/login') {
      return <>{children}</>;
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // If we've determined user does not have access
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
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm mt-4">
              {error}
            </div>
          )}
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
  
  // If user has access, render the children
  return <>{children}</>;
};

export default AuthGuard;
