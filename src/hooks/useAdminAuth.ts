import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAdminRole = async (userId: string) => {
      console.log('Checking admin role for user:', userId);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();

        console.log('Admin check result:', { data, error });

        if (isMounted) {
          if (error) {
            console.error('Error checking admin role:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(!!data);
          }
          setIsLoading(false);
          setAuthChecked(true);
        }
      } catch (error) {
        console.error('Error:', error);
        if (isMounted) {
          setIsAdmin(false);
          setIsLoading(false);
          setAuthChecked(true);
        }
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            // Use setTimeout to avoid Supabase deadlock
            setTimeout(() => {
              if (isMounted) {
                checkAdminRole(currentSession.user.id);
              }
            }, 0);
          } else {
            setIsAdmin(false);
            setIsLoading(false);
            setAuthChecked(true);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.email);

      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          checkAdminRole(currentSession.user.id);
        } else {
          setIsLoading(false);
          setAuthChecked(true);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    }
    return { error };
  };

  return {
    user,
    session,
    isAdmin,
    isLoading,
    authChecked,
    signIn,
    signOut,
  };
};
