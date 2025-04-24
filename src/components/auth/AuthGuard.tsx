import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { user, loading, refreshSession, userData } = useAuth();
  const location = useLocation();
  const [hasPageAccess, setHasPageAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const pageId = location.pathname.split('/')[1] || 'dashboard';
  
  const handleRefreshSession = async () => {
    setRetryCount(prev => prev + 1);
    const success = await refreshSession();
    if (success) {
      setCheckingAccess(true);
    }
  };
  
  const checkAccess = async () => {
    try {
      console.log('Checking access for page:', pageId);
      setError(null);
      
      if (pageId === 'auth') {
        console.log('Auth page detected, allowing access');
        setHasPageAccess(true);
        setCheckingAccess(false);
        return;
      }
      
      if (!user) {
        console.log('No user found, denying access');
        setHasPageAccess(false);
        setCheckingAccess(false);
        return;
      }
      
      if (userData?.role === 'admin') {
        console.log('Admin detected, granting access');
        setHasPageAccess(true);
        setCheckingAccess(false);
        return;
      }
      
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
        user_uid: user.id
      });
      
      if (roleError) {
        console.error('Error checking user role:', roleError);
        if (userData?.role) {
          const userRole = userData.role as UserRole;
          const isAdmin = userRole === 'admin';
          console.log(`Using cached role data: ${userRole}, isAdmin: ${isAdmin}`);
          setHasPageAccess(isAdmin);
          setCheckingAccess(false);
          return;
        }
        throw roleError;
      }
      
      if (roleData === 'admin') {
        console.log('User is admin, granting access to all pages');
        setHasPageAccess(true);
        setCheckingAccess(false);
        return;
      }
      
      console.log(`Checking page permission for role ${roleData} and page ${pageId}`);
      const { data: permissionData, error: permError } = await supabase
        .from('role_permissions')
        .select('allowed')
        .eq('role', roleData)
        .eq('permission_type', 'page')
        .eq('permission_id', pageId)
        .maybeSingle();
        
      if (permError) {
        console.error('Error checking page permission:', permError);
        throw permError;
      }
      
      const hasAccess = permissionData?.allowed === true;
      console.log(`Permission for ${pageId}: ${hasAccess ? 'Granted ✅' : 'Denied ❌'}`);
      setHasPageAccess(hasAccess);
      
    } catch (error: any) {
      console.error('Error checking page access:', error);
      setError(error.message || 'Error al verificar permisos');
      
      setHasPageAccess(userData?.role === 'admin');
    } finally {
      setCheckingAccess(false);
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    
    const runAccessCheck = async () => {
      if (!loading && isMounted) {
        await checkAccess();
      }
    };
    
    runAccessCheck();
    
    return () => {
      isMounted = false;
    };
  }, [user, loading, pageId, retryCount, userData?.role]);
  
  if (loading || checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acceso...</p>
          {checkingAccess && retryCount > 2 && (
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
  
  if (!user) {
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
  
  return <>{children}</>;
};

export default AuthGuard;
