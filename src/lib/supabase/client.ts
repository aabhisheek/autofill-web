"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/env";

// Browser-side client. Only the anon key lives here — the RLS policies in
// migrations/0001_init.sql are what actually scope queries to the signed-in
// user, so exposing this key is safe by design.
let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!client) client = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  return client;
}
