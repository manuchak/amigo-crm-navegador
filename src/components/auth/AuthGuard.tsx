
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/SupabaseAuthContext'; // Updated import
import { Loader2 } from 'lucide-react';
import { useRolePermissions } from '@/hooks/useRolePermissions';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { hasPermission } = useRolePermissions();
  const [hasPageAccess, setHasPageAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  
  // Extract page ID from the current path
  const pageId = location.pathname.split('/')[1] || 'dashboard';
  
  // Check if the user has permission to access this page
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasPageAccess(false);
        setCheckingAccess(false);
        return;
      }
      
      try {
        // No permission check needed for the auth page
        if (pageId === 'auth') {
          setHasPageAccess(true);
          setCheckingAccess(false);
          return;
        }
        
        // Check if the user has permission to access this page
        const canAccess = await hasPermission('page', pageId);
        setHasPageAccess(canAccess);
      } catch (error) {
        console.error('Error checking page access:', error);
        // Default to allow access if there's an error checking permissions
        setHasPageAccess(true);
      } finally {
        setCheckingAccess(false);
      }
    };
    
    if (!loading) {
      checkAccess();
    }
  }, [user, loading, pageId, hasPermission]);
  
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
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4"
            variant="outline"
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  // User is authenticated and has access to the page
  return <>{children}</>;
};

// Button component for the access denied page
const Button = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'default' 
}: { 
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'outline'; 
}) => {
  const baseStyles = "px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantStyles = {
    default: "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default AuthGuard;
