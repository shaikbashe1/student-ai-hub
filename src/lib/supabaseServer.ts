import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"] || "";
const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("Supabase server environment variables are missing! Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export default supabaseServer;
