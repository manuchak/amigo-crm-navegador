
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { verifyUserEmail, findUserByEmail, setAsVerifiedOwner } from '@/utils/auth';
import { UserManagementHookProps } from './types';
import { useCallback } from 'react';

export const useUserVerification = ({ setLoading, refreshUserData }: UserManagementHookProps) => {
  // Función para verificar el email de un usuario
  const verifyEmail = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      console.log(`Verificando el email para el usuario ${uid}`);
      
      // Intentar usar la función RPC de Supabase primero
      try {
        const { error: rpcError } = await supabase.rpc('verify_user_email', {
          target_user_id: uid
        });
        
        if (rpcError) {
          console.error('Error usando RPC para verificación de email:', rpcError);
          // Usar implementación local como fallback
          verifyUserEmail(uid);
        } else {
          console.log('Email verificado exitosamente vía RPC de Supabase');
        }
      } catch (rpcErr) {
        console.error('No se pudo usar el método RPC, usando implementación local:', rpcErr);
        // Marcar email como verificado en localStorage
        verifyUserEmail(uid);
      }
      
      toast.success('Correo electrónico verificado con éxito');
      await refreshUserData();
    } catch (error) {
      console.error('Error al verificar email:', error);
      toast.error('Error al verificar el correo electrónico');
    } finally {
      setLoading(false);
    }
  }, [setLoading, refreshUserData]);
  
  // Función para establecer un usuario como propietario verificado
  const setUserAsVerifiedOwner = useCallback(async (email: string, showNotification: boolean = true) => {
    if (!email) {
      console.error("No se proporcionó email para setUserAsVerifiedOwner");
      return;
    }

    setLoading(true);
    try {
      console.log(`Intentando establecer el usuario ${email} como propietario verificado`);
      
      // Primero intentar encontrar el usuario en Supabase
      let userUid: string | undefined;
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle();
        
        if (profileData && !profileError) {
          userUid = profileData.id;
          console.log(`Usuario encontrado en Supabase con id: ${userUid}`);
        }
      } catch (supabaseError) {
        console.error('Error buscando usuario en Supabase:', supabaseError);
      }
      
      // Si no se encontró en Supabase, verificar localStorage
      if (!userUid) {
        const user = findUserByEmail(email);
        
        if (user && user.uid) {
          userUid = user.uid;
          console.log(`Usuario encontrado en localStorage con id: ${userUid}`);
        }
      }
      
      // Si el usuario existe en cualquiera de las ubicaciones
      if (userUid) {
        // Intentar actualizar rol vía RPC de Supabase primero
        try {
          const { error: rpcError } = await supabase.rpc('update_user_role', {
            target_user_id: userUid,
            new_role: 'owner'
          });
          
          if (!rpcError) {
            console.log(`Rol actualizado a propietario para usuario ${email} vía RPC de Supabase`);
          } else {
            // Fallar a implementación local
            setAsVerifiedOwner(userUid);
            console.log(`Rol actualizado a propietario para usuario ${email} vía localStorage`);
          }
        } catch (rpcErr) {
          // Fallar a implementación local
          setAsVerifiedOwner(userUid);
          console.log(`Rol actualizado a propietario para usuario ${email} vía localStorage después de falla de RPC`);
        }
      } else {
        throw new Error(`Usuario ${email} no encontrado`);
      }
      
      // Solo mostrar notificación de éxito si se solicitó explícitamente
      if (showNotification) {
        toast.success(`Usuario ${email} configurado como propietario verificado`);
      }
      
      await refreshUserData();
    } catch (error: any) {
      console.error('Error al establecer el usuario como propietario verificado:', error);
      toast.error('Error al configurar el usuario como propietario verificado: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, [setLoading, refreshUserData]);

  return {
    verifyEmail,
    setUserAsVerifiedOwner
  };
};
