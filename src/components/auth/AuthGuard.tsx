
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
  const [accessVerified, setAccessVerified] = useState<boolean>(false);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const pageId = location.pathname.split('/')[1] || 'dashboard';
  
  // Handle session refresh without re-entering verification loop
  const handleRefreshSession = async () => {
    try {
      setError(null);
      await refreshUserData();
      // After refresh, we'll let the effect handle access verification
    } catch (error: any) {
      console.error('Error refreshing session:', error);
      setError(error.message || 'Error refreshing session');
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
  
  // Single effect to check access permissions once loading is complete
  useEffect(() => {
    // Skip verification during loading or if we've already verified access
    if (loading || accessVerified || accessDenied) {
      return;
    }
    
    console.log('AuthGuard checking access: Page:', pageId, 'User:', !!currentUser);
    
    // Always allow access to auth pages
    if (pageId === 'auth' || pageId === 'login') {
      setAccessVerified(true);
      return;
    }
    
    // If no user, deny access
    if (!currentUser) {
      setAccessDenied(true);
      return;
    }
    
    // Special case for admin/owner
    if (currentUser.role === 'admin' || currentUser.role === 'owner') {
      setAccessVerified(true);
      return;
    }
    
    // Check role-based access
    const hasAccess = checkRoleAccess(currentUser.role, pageId);
    if (hasAccess) {
      setAccessVerified(true);
    } else {
      setAccessDenied(true);
    }
    
  }, [currentUser, loading, pageId]);
  
  // Show loading state while checking
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acceso...</p>
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
  
  // If access is denied based on role
  if (accessDenied) {
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
  
  // Access is verified, render the children
  return <>{children}</>;
};

export default AuthGuard;
