import { useSession } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "../lib/supabaseClient";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Custom React Hook that provides an authenticated Supabase client.
 * It automatically extracts Clerk's authenticated session JWT template,
 * formats authentication headers, and re-instantiates the client whenever
 * the user signs in, signs out, or their clerk session refreshes.
 * 
 * Perfect for client-side queries containing private student data.
 */
export function useSupabase() {
  const { session } = useSession();
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient>(() => 
    createSupabaseClient()
  );

  useEffect(() => {
    // If user is logged out, restore the public anon default client
    if (!session) {
      setSupabaseClient(createSupabaseClient());
      return;
    }

    let active = true;

    async function syncSessionToken() {
      try {
        // Fetch the minted JWT constructed specifically matching the Supabase format.
        // Make sure you configured the 'supabase' integration template in Clerk dashboard!
        const token = await session?.getToken({ template: "supabase" });
        
        if (active && token) {
          setSupabaseClient(createSupabaseClient(token));
        }
      } catch (err) {
        console.error("Error fetching Clerk authentication token for Supabase integration:", err);
      }
    }

    syncSessionToken();

    return () => {
      active = false;
    };
  }, [session]);

  return supabaseClient;
}
export default useSupabase;
