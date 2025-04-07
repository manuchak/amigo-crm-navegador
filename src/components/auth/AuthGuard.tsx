
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login'
}) => {
  const { currentUser, userData, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user has one of the allowed roles (if specified)
  if (
    allowedRoles.length > 0 && 
    userData && 
    !allowedRoles.includes(userData.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has appropriate role
  return <>{children}</>;
};

export default AuthGuard;
