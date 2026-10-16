import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/env";

// Service-role client. Bypasses RLS, so it is only used where a request must
// operate outside any single user's session (extension sync, token minting).
// Never import this from a "use client" file.
export function createAdminClient() {
  return createSupabaseClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
