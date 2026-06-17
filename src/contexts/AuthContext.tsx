import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  auth, db, onAuthChanged, signInWithGoogle, signInWithEmail,
  registerWithEmail, resetPassword, logout,
  doc, getDoc, setDoc, updateDoc,
  type User,
} from '../lib/firebase';
import { Profile, SubscriptionPlan, PLAN_LIMITS } from '../types';
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
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as Profile) : null;
  }, []);

  const createProfile = useCallback(async (u: User, name?: string): Promise<Profile> => {
    const today = new Date().toISOString().split('T')[0];
    const p: Profile = {
      id: u.uid, name: name || u.displayName || u.email!.split('@')[0],
      email: u.email!, avatar_url: u.photoURL ?? undefined,
      role: 'student', plan: 'free', email_verified: u.emailVerified,
      daily_ai_requests: 0, daily_ai_limit: PLAN_LIMITS.free.daily_ai_requests,
      last_quota_reset: today, skills: [], saved_items: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', u.uid), p);
    return p;
  }, []);

  const resetQuotaIfNeeded = useCallback(async (p: Profile): Promise<Profile> => {
    const today = new Date().toISOString().split('T')[0];
    if (p.last_quota_reset !== today) {
      const planLimit = PLAN_LIMITS[p.plan]?.daily_ai_requests ?? 5;
      const upd = { daily_ai_requests: 0, last_quota_reset: today, daily_ai_limit: planLimit, updated_at: new Date().toISOString() };
      await updateDoc(doc(db, 'users', p.id), upd);
      return { ...p, ...upd };
    }
    return p;
  }, []);

  useEffect(() => {
    const unsub = onAuthChanged(async (u) => {
      setUser(u);
      if (u) {
        try {
          let p = await fetchProfile(u.uid);
          if (!p) p = await createProfile(u);
          p = await resetQuotaIfNeeded(p);
          setProfile(p);
        } catch (e) { console.error('Profile error:', e); }
      } else { setProfile(null); }
      setLoading(false);
    });
    return unsub;
  }, [fetchProfile, createProfile, resetQuotaIfNeeded]);

  const handleError = (err: unknown): never => {
    const raw = err instanceof Error ? err.message : 'Authentication failed';
    const msg = raw.replace('Firebase: ', '').replace(/\s*\(auth\/[^)]+\)/, '').trim();
    setError(msg);
    throw err;
  };

  const loginWithGoogle = async () => {
    setError(null);
    try { const c = await signInWithGoogle(); trackEvent('login', { method: 'google', uid: c.user.uid }); }
    catch (e) { handleError(e); }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    try { const c = await signInWithEmail(email, password); trackEvent('login', { method: 'email', uid: c.user.uid }); }
    catch (e) { handleError(e); }
  };

  const register = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const c = await registerWithEmail(email, password);
      await createProfile(c.user, name);
      trackEvent('signup', { method: 'email', uid: c.user.uid });
    } catch (e) { handleError(e); }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    try { await resetPassword(email); } catch (e) { handleError(e); }
  };

  const handleSignOut = async () => {
    await logout();
    setProfile(null);
    trackEvent('logout', {});
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await fetchProfile(user.uid);
    if (p) setProfile(await resetQuotaIfNeeded(p));
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;
    const withTs = { ...updates, updated_at: new Date().toISOString() };
    await updateDoc(doc(db, 'users', user.uid), withTs);
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
    await updateDoc(doc(db, 'users', user.uid), { daily_ai_requests: next, updated_at: new Date().toISOString() });
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
