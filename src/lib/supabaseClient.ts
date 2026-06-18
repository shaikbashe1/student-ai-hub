import { createClient, SupabaseClient, Session, User } from "@supabase/supabase-js";

// ── Env vars ─────────────────────────────────────────────────────────────────
// In Vite, public env vars are exposed as import.meta.env.VITE_*
const SUPABASE_URL: string =
  (import.meta as any).env?.VITE_SUPABASE_URL ?? "";

const SUPABASE_ANON_KEY: string =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. " +
    "Copy .env.example to .env and fill in your Supabase project values."
  );
}

// ── Singleton Supabase client ─────────────────────────────────────────────────
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,           // Persists session in localStorage
    detectSessionInUrl: true,       // Reads access_token from OAuth redirect URL
    storageKey: "student_ai_hub_auth", // Custom storage key to avoid collisions
  },
});

// ── Typed exports ─────────────────────────────────────────────────────────────
export type { Session, User };

// ── Google OAuth sign-in ──────────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      scopes: "openid email profile",
    },
  });
  if (error) throw error;
}

// ── Email / password sign-up ──────────────────────────────────────────────────
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Sign-up failed: no user returned.");
  return data.user;
}

// ── Email / password sign-in ──────────────────────────────────────────────────
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("Sign-in failed: no user returned.");
  return data.user;
}

// ── Sign out ──────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Get current session ───────────────────────────────────────────────────────
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

// ── Password reset ────────────────────────────────────────────────────────────
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
}
