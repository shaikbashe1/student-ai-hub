import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * AuthCallback — mounted at /auth/callback
 * Supabase OAuth redirects here after Google sign-in with #access_token in the URL.
 * Supabase's detectSessionInUrl:true automatically exchanges it.
 * We just need to wait and then redirect to the app.
 */
export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handle = async () => {
      try {
        // detectSessionInUrl is true — getSession picks up the token from the URL fragment
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          // Try exchangeCodeForSession if PKCE flow used
          const url = new URL(window.location.href);
          const code = url.searchParams.get("code");
          if (code) {
            const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
            if (exchErr) throw exchErr;
          } else {
            throw error ?? new Error("No session or code found");
          }
        }

        setStatus("success");
        // Short delay so user sees success, then redirect
        setTimeout(() => {
          window.location.replace("/");
        }, 1200);
      } catch (err: any) {
        setErrorMsg(err.message || "Authentication failed");
        setStatus("error");
      }
    };

    handle();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="h-12 w-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-slate-300 text-sm font-medium">Completing sign-in…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400 text-2xl">✓</div>
            <p className="text-emerald-400 text-sm font-semibold">Signed in successfully!</p>
            <p className="text-slate-500 text-xs">Redirecting…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-400 text-2xl">✗</div>
            <p className="text-red-400 text-sm font-semibold">Sign-in failed</p>
            <p className="text-slate-500 text-xs max-w-xs mx-auto">{errorMsg}</p>
            <button
              onClick={() => window.location.replace("/")}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
