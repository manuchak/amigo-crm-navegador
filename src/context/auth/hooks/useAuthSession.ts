
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

    // Configure auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed');
          if (mounted) {
            setSession(newSession);
            setUser(newSession?.user || null);
          }
          
          if (newSession?.user) {
            // Use setTimeout to avoid potential Supabase deadlocks
            setTimeout(async () => {
              if (!mounted) return;
              
              try {
                await updateLastLogin(newSession.user.id);
                const userData = await mapUserData(newSession.user);
                if (mounted) {
                  setUserData(userData);
                  console.log("User data mapped successfully:", userData);
                }
              } catch (err) {
                console.error("Error processing user data on auth change:", err);
              } finally {
                if (mounted) {
                  setLoading(false);
                  setIsInitializing(false);
                }
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          if (mounted) {
            setSession(null);
            setUser(null);
            setUserData(null);
            setLoading(false);
            setIsInitializing(false);
          }
        } else {
          // For other events, still update loading state
          if (mounted) {
            setLoading(false);
            setIsInitializing(false);
          }
        }
      }
    );

    // Then check for existing session
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
              // Use setTimeout to avoid potential deadlocks
              setTimeout(async () => {
                if (!mounted) return;
                
                try {
                  await updateLastLogin(data.session.user.id);
                  const userData = await mapUserData(data.session.user);
                  if (mounted) {
                    setUserData(userData);
                    console.log("User data loaded from existing session:", userData);
                  }
                } catch (err) {
                  console.error("Error processing existing user session:", err);
                } finally {
                  if (mounted) {
                    setLoading(false);
                    setIsInitializing(false);
                  }
                }
              }, 0);
            } catch (error) {
              console.error('Error mapping user data on init:', error);
              if (mounted) {
                setLoading(false);
                setIsInitializing(false);
              }
            }
          } else {
            if (mounted) {
              setLoading(false);
              setIsInitializing(false);
            }
          }
        } else {
          console.log("No existing session found");
          if (mounted) {
            setLoading(false);
            setIsInitializing(false);
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        if (mounted) {
          setLoading(false);
          setIsInitializing(false);
        }
      }
    };
    
    // Run session check
    checkExistingSession();

    // Clean up
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
};
