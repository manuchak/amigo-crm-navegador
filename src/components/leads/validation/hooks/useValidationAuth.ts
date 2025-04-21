
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

/**
 * Hook to manage validation authentication states and checks
 */
export const useValidationAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const { currentUser, userData } = useAuth();

  // Verify authentication with special handling for owner role
  useEffect(() => {
    const checkSession = async () => {
      // Clear any previous error
      setError(null);
    
      try {
        // Check if there's a valid session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error('Error al verificar la sesión: ' + sessionError.message);
        }
        
        if (!sessionData?.session) {
          // Special case for owner role - allow operation despite missing session
          if (userData?.role === 'owner' as UserRole) {
            console.log('Usuario con rol owner - acceso concedido a pesar de sesión faltante');
            return; // Exit early, don't throw error for owners
          }
          
          throw new Error('No se detectó una sesión activa. Por favor inicie sesión nuevamente.');
        }
        
        // Check if we have a user
        if (!currentUser && userData?.role !== 'owner' as UserRole) {
          throw new Error('No se detectó un usuario activo. Por favor inicie sesión nuevamente.');
        }
        
        // Check if user is owner - owners should have all permissions
        if (userData?.role === 'owner' as UserRole) {
          console.log('Usuario con rol owner - acceso total concedido');
          // No error for owners - they should have all permissions
        }
      } catch (err: any) {
        // Special case for owner role - always grant access regardless of errors
        if (userData?.role === 'owner' as UserRole) {
          console.log('Error de autenticación pero usuario es propietario - acceso concedido');
          return; // Exit early, don't set error for owners
        }
        
        console.error('Authentication error:', err);
        setError(err.message || 'Error de autenticación. Por favor inicie sesión nuevamente.');
      }
    };
    
    checkSession();
  }, [currentUser, userData]);

  // Check authentication status with special handling for owners
  const checkAuthStatus = (): boolean => {
    if (!currentUser && userData?.role !== 'owner' as UserRole) {
      const errorMessage = 'Sesión no válida. Por favor inicie sesión nuevamente.';
      setError(errorMessage);
      return false;
    }
    
    // Special handling for owners - they should always have access
    if (userData?.role === 'owner' as UserRole) {
      console.log('Usuario con rol propietario - acceso total concedido');
      return true;
    }
    
    if (!userData && userData?.role !== 'owner' as UserRole) {
      const errorMessage = 'No se pudieron obtener los datos de usuario. Por favor inicie sesión nuevamente.';
      setError(errorMessage);
      return false;
    }
    
    return true;
  };

  const isOwner = userData?.role === 'owner' as UserRole;

  return {
    error,
    setError,
    currentUser,
    userData,
    isOwner,
    checkAuthStatus
  };
};
