import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth'; // Updated import path
import { supabase, checkForOwnerRole } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

/**
 * Hook to manage validation authentication states and checks
 * with improved security handling
 */
export const useValidationAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const { currentUser, userData } = useAuth();
  const [hasValidPermission, setHasValidPermission] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Verify authentication with special handling for owner role
  useEffect(() => {
    const checkSession = async () => {
      // Clear any previous error
      setError(null);
    
      try {
        // First check for owner status which grants all permissions
        const ownerStatus = await checkForOwnerRole();
        setIsOwner(ownerStatus);
        
        if (ownerStatus) {
          console.log('Usuario con rol owner - acceso total concedido');
          setHasValidPermission(true);
          return;
        }
        
        // Check if there's a valid session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error('Error al verificar la sesión: ' + sessionError.message);
        }
        
        // If not owner, verify if session exists
        if (!sessionData?.session) {
          throw new Error('No se detectó una sesión activa. Por favor inicie sesión nuevamente.');
        }
        
        // Check if we have a user
        if (!currentUser && !isOwner) {
          throw new Error('No se detectó un usuario activo. Por favor inicie sesión nuevamente.');
        }
        
        // If user has validated role, check specific permissions
        if (userData && userData.role) {
          try {
            // Verify role-based permission for validation page
            const { data, error: permError } = await supabase
              .from('role_permissions')
              .select('allowed')
              .eq('role', userData.role)
              .eq('permission_type', 'page')
              .eq('permission_id', 'validation')
              .maybeSingle();
              
            if (permError) {
              console.error('Error checking page permissions:', permError);
            } else {
              // Set permission flag based on result
              setHasValidPermission(!!data?.allowed);
            }
          } catch (permCheckErr) {
            console.error('Error in permission validation:', permCheckErr);
          }
        }
      } catch (err: any) {
        // Special case for owner role - always grant access regardless of errors
        const ownerStatus = await checkForOwnerRole();
        if (ownerStatus || userData?.role === 'owner' as UserRole) {
          console.log('Error de autenticación pero usuario es propietario - acceso concedido');
          setIsOwner(true);
          setHasValidPermission(true);
          return; // Exit early, don't set error for owners
        }
        
        console.error('Authentication error:', err);
        setError(err.message || 'Error de autenticación. Por favor inicie sesión nuevamente.');
        setHasValidPermission(false);
      }
    };
    
    checkSession();
  }, [currentUser, userData]);

  // Check authentication status with special handling for owners
  // Changed to return Promise<boolean> to match async implementation
  const checkAuthStatus = async (): Promise<boolean> => {
    // Special handling for owners - they should always have access
    const ownerStatus = await checkForOwnerRole();
    if (ownerStatus) {
      console.log('Usuario con rol propietario - acceso total concedido');
      return true;
    }
    
    if (!currentUser && !isOwner) {
      const errorMessage = 'Sesión no válida. Por favor inicie sesión nuevamente.';
      setError(errorMessage);
      return false;
    }
    
    if (!userData && !isOwner) {
      const errorMessage = 'No se pudieron obtener los datos de usuario. Por favor inicie sesión nuevamente.';
      setError(errorMessage);
      return false;
    }
    
    return hasValidPermission;
  };

  return {
    error,
    setError,
    currentUser,
    userData,
    isOwner,
    checkAuthStatus,
    hasValidPermission
  };
};
