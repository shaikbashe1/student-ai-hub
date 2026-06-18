import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import {
  supabase,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
} from "../lib/supabaseClient";
import { Profile } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  // Actions
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<User | null>(null);
  const [session, setSession]     = useState<Session | null>(null);
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [loading, setLoading]     = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ── Fetch or create profile from the Express backend ───────────────────────
  const fetchOrCreateProfile = useCallback(async (authUser: User): Promise<Profile | null> => {
    try {
      const name =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "Student";

      const avatarUrl =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        undefined;

      const res = await fetch("/api/auth/supabase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabase_uid: authUser.id,
          email: authUser.email,
          name,
          avatar_url: avatarUrl,
        }),
      });

      if (!res.ok) {
        console.error("[Auth] profile sync failed:", res.status);
        return null;
      }

      const data = await res.json();
      return data.profile ?? null;
    } catch (err) {
      console.error("[Auth] fetchOrCreateProfile error:", err);
      return null;
    }
  }, []);

  // ── Refresh profile (quota sync, etc.) ─────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const updated = await fetchOrCreateProfile(user);
    if (updated) setProfile(updated);
  }, [user, fetchOrCreateProfile]);

  // ── Bootstrap: restore session on page load ─────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();

        if (existingSession?.user && mounted) {
          setSession(existingSession);
          setUser(existingSession.user);

          const p = await fetchOrCreateProfile(existingSession.user);
          if (mounted) setProfile(p);
        }
      } catch (err) {
        console.error("[Auth] bootstrap error:", err);
      } finally {
        if (mounted) setInitialized(true);
      }
    };

    bootstrap();

    // ── Real-time auth state listener ─────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            const p = await fetchOrCreateProfile(newSession.user);
            if (mounted) setProfile(p);
          }
        }

        if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setProfile(null);
        }

        if (event === "USER_UPDATED" && newSession?.user) {
          setUser(newSession.user);
          const p = await fetchOrCreateProfile(newSession.user);
          if (mounted) setProfile(p);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchOrCreateProfile]);

  // ── Auth actions ─────────────────────────────────────────────────────────────

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // Redirect happens — Supabase handles callback & fires onAuthStateChange
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const authUser = await signInWithEmail(email, password);
      // onAuthStateChange will fire and set user + profile
      setUser(authUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerWithEmail = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const authUser = await signUpWithEmail(email, password, name);
      setUser(authUser);
      // Profile creation fires via onAuthStateChange → fetchOrCreateProfile
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    loading,
    initialized,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Consumer hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export default AuthContext;
