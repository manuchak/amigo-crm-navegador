
import { useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/auth';
import { mapUserData } from './utils/userDataMapper';
import { updateLastLogin } from './utils/userActions';

interface UseAuthSessionProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsInitializing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAuthSession = ({
  setUser,
  setSession,
  setUserData,
  setLoading,
  setIsInitializing
}: UseAuthSessionProps) => {
  useEffect(() => {
    let mounted = true;
    console.log("Setting up auth state listener...");
    setLoading(true);

    // First, configure the authentication event listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed');
          setSession(newSession);
          setUser(newSession?.user || null);
          
          if (newSession?.user) {
            // Use setTimeout to avoid potential Supabase deadlocks
            setTimeout(async () => {
              if (mounted) {
                await updateLastLogin(newSession.user.id);
                const userData = await mapUserData(newSession.user);
                if (mounted) setUserData(userData);
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
          setUserData(null);
        }
        
        setLoading(false);
        setIsInitializing(false);
      }
    );

    // Second, check for existing session
    const checkExistingSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (mounted) {
            setLoading(false);
            setIsInitializing(false);
          }
          return;
        }
        
        if (data?.session) {
          console.log("Found existing session");
          if (mounted) {
            setSession(data.session);
            setUser(data.session.user);
          }
          
          if (data.session.user && mounted) {
            try {
              setTimeout(async () => {
                if (!mounted) return;
                
                await updateLastLogin(data.session.user.id);
                const userData = await mapUserData(data.session.user);
                if (mounted) setUserData(userData);
              }, 0);
            } catch (error) {
              console.error('Error mapping user data on init:', error);
            }
          }
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitializing(false);
        }
      }
    };
    
    checkExistingSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
};
