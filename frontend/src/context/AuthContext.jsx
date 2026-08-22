import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Supabase auth user
  const [profile, setProfile] = useState(null); // profiles row (name, role…)
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [recoverySession, setRecoverySession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') setRecoverySession(true);
      if (!session?.user) {
        setProfile(null);
        setRecoverySession(false);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Keep profile in sync with the auth user
  const refreshProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setProfile(null);
      setProfileLoading(false);
      return null;
    }
    setProfileLoading(true);
    try {
      const p = await api.me();
      setProfile(p);
      return p;
    } catch {
      setProfile(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) refreshProfile();
    else setProfile(null);
  }, [user, refreshProfile]);

  const isAdmin = Boolean(profile?.role === 'admin');

  const signUp = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    await refreshProfile();
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRecoverySession(false);
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user?.email) throw new Error('Your session is missing an email address. Please sign in again.');
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) throw new Error('Current password is incorrect.');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    refreshProfile,
    signUp,
    signIn,
    signOut,
    changePassword,
    recoverySession,
    profileLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
