import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles both the email-confirmation link and the OAuth redirect from Supabase.
// Supabase sends a `code` that we exchange for a session cookie.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/dashboard"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
