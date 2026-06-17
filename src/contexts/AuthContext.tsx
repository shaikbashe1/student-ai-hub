import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Profile, PLAN_LIMITS } from '../types';
import { trackEvent } from '../lib/analytics';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  canMakeAIRequest: () => boolean;
  incrementAIUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (uid: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    if (error) {
      console.error('Error fetching profile from Supabase:', error.message);
      return null;
    }
    return data as Profile;
  }, []);

  const createProfile = useCallback(async (u: User, name?: string): Promise<Profile> => {
    const today = new Date().toISOString().split('T')[0];
    const email = u.email || '';
    const isAdminEmail = email.toLowerCase() === 'shaikbashe1111@gmail.com';
    const p: Profile = {
      id: u.id,
      name: name || u.user_metadata?.name || email.split('@')[0],
      email: email,
      avatar_url: u.user_metadata?.avatar_url ?? undefined,
      role: isAdminEmail ? 'admin' : 'student',
      plan: 'free',
      email_verified: !!u.email_confirmed_at,
      daily_ai_requests: 0,
      daily_ai_limit: PLAN_LIMITS.free.daily_ai_requests,
      last_quota_reset: today,
      skills: [],
      saved_items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      daily_prompt_count: 20,
      last_prompt_date: today
    };

    const { error: insertError } = await supabase.from('profiles').upsert(p);
    if (insertError) {
      console.error('Error upserting profile in Supabase:', insertError.message);
    }
    return p;
  }, []);

  const resetQuotaIfNeeded = useCallback(async (p: Profile): Promise<Profile> => {
    const today = new Date().toISOString().split('T')[0];
    if (p.last_quota_reset !== today) {
      const planLimit = PLAN_LIMITS[p.plan]?.daily_ai_requests ?? 5;
      const upd = {
        daily_ai_requests: 0,
        last_quota_reset: today,
        daily_ai_limit: planLimit,
        daily_prompt_count: 20,
        last_prompt_date: today,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from('profiles')
        .update(upd)
        .eq('id', p.id);
      if (error) {
        console.error('Error resetting quota in Supabase:', error.message);
      }
      return { ...p, ...upd };
    }
    return p;
  }, []);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id).then(async (p) => {
          if (!p) {
            p = await createProfile(u);
          }
          p = await resetQuotaIfNeeded(p);
          setProfile(p);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        let p = await fetchProfile(u.id);
        if (!p) {
          p = await createProfile(u);
        }
        p = await resetQuotaIfNeeded(p);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, createProfile, resetQuotaIfNeeded]);

  const loginWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(error.message);
      throw error;
    }
    trackEvent('login', { method: 'google' });
  };

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      throw error;
    }
    if (data.user) {
      trackEvent('login', { method: 'email', uid: data.user.id });
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    });
    if (error) {
      setError(error.message);
      throw error;
    }
    if (data.user) {
      await createProfile(data.user, name);
      trackEvent('signup', { method: 'email', uid: data.user.id });
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      throw error;
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    trackEvent('logout', {});
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) setProfile(await resetQuotaIfNeeded(p));
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;
    const withTs = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from('profiles')
      .update(withTs)
      .eq('id', user.id);
    if (error) {
      setError(error.message);
      throw error;
    }
    setProfile((prev) => prev ? { ...prev, ...withTs } : prev);
  };

  const canMakeAIRequest = (): boolean => {
    if (!profile) return false;
    if (profile.daily_ai_limit === -1) return true;
    return profile.daily_ai_requests < profile.daily_ai_limit;
  };

  const incrementAIUsage = async () => {
    if (!user || !profile) return;
    const next = profile.daily_ai_requests + 1;
    const { error } = await supabase
      .from('profiles')
      .update({ daily_ai_requests: next, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) {
      console.error('Error incrementing AI usage in Supabase:', error.message);
    }
    setProfile((prev) => prev ? { ...prev, daily_ai_requests: next } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, error, clearError: () => setError(null),
      loginWithGoogle, loginWithEmail, register, sendPasswordReset,
      signOut: handleSignOut, refreshProfile, updateProfile,
      canMakeAIRequest, incrementAIUsage,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
