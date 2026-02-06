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
      try {
        const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
        if (isMounted) { setIsAdmin(error ? false : !!data); setIsLoading(false); setAuthChecked(true); }
      } catch { if (isMounted) { setIsAdmin(false); setIsLoading(false); setAuthChecked(true); } }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (isMounted) { setSession(currentSession); setUser(currentSession?.user ?? null);
        if (currentSession?.user) setTimeout(() => { if (isMounted) checkAdminRole(currentSession.user.id); }, 0);
        else { setIsAdmin(false); setIsLoading(false); setAuthChecked(true); }
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (isMounted) { setSession(s); setUser(s?.user ?? null); if (s?.user) checkAdminRole(s.user.id); else { setIsLoading(false); setAuthChecked(true); } }
    });
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => { setIsLoading(true); const { error } = await supabase.auth.signInWithPassword({ email, password }); return { error }; };
  const signOut = async () => { const { error } = await supabase.auth.signOut(); if (!error) { setUser(null); setSession(null); setIsAdmin(false); } return { error }; };
  return { user, session, isAdmin, isLoading, authChecked, signIn, signOut };
};
