
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/auth';
import { mapUserData } from '@/utils/userDataMapper';

/**
 * Hook to manage Supabase auth session state
 */
export function useSessionManager() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log("Setting up auth state listener in useSessionManager hook");
    
    // Set up the auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change event:', event);
        
        if (!mounted) return;
        
        // Update session immediately
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          try {
            // Get profile data
            const mappedUserData = await mapUserData(newSession.user);
            if (mounted) {
              setUserData(mappedUserData);
              console.log('Authenticated user loaded:', mappedUserData?.email);
            }
          } catch (error) {
            console.error('Error getting profile data:', error);
            if (mounted) setUserData(null);
          } finally {
            if (mounted) {
              setLoading(false);
              setIsInitializing(false);
            }
          }
        } else {
          if (mounted) {
            console.log('No active session in auth state change');
            setUserData(null);
            setLoading(false);
            setIsInitializing(false);
          }
        }
      }
    );

    // THEN check for an existing session
    const checkSession = async () => {
      try {
        console.log('Checking for existing session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
            setIsInitializing(false);
          }
          return;
        }
        
        if (data.session) {
          console.log('Existing session found:', data.session.user.email);
          // Session handling will be done by the auth state change listener
        } else {
          console.log('No existing session');
          if (mounted) {
            setLoading(false);
            setIsInitializing(false);
          }
        }
      } catch (err) {
        console.error('Unexpected error checking session:', err);
        if (mounted) {
          setLoading(false);
          setIsInitializing(false);
        }
      }
    };

    // Run session check
    checkSession();

    return () => {
      console.log('Cleaning up auth listeners');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    userData,
    loading,
    isInitializing,
    setUserData
  };
}
