import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Creates an authenticated Supabase server-side client utilizing Clerk's Server Auth context.
 * This ensures queries made from Next.js 15 Server Components, Server Actions,
 * and standard API routes respect all PostgreSQL Row-Level Security (RLS) policies.
 */
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  // Retrieve active session token from Clerk, fetching the JWT minted from the Supabase integration template
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    },
    auth: {
      persistSession: false,
    }
  });
}

/**
 * Creates an admin or system-level Supabase client using the secure Service Role key.
 * Used exclusively for direct queries bypassing RLS, such as onboarding, synced users creation,
 * or server-verified administrative tasks.
 * 
 * CRITICAL: This is a server-only script and must NEVER be resolved or exposed to client bundles.
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase Admin Credentials. Ensure SUPABASE_SERVICE_ROLE_KEY is correctly declared on your secure server.");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
