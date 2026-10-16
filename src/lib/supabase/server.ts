import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Server component / route handler client. It reads the user's own auth cookies,
// so every query it makes runs under their identity and RLS applies normally.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies cannot be written.
          // The middleware refreshes the session instead, so this is safe.
        }
      }
    }
  });
}
