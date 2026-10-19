"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { identify, initAnalytics, resetAnalytics, track } from "@/lib/analytics";

// Mounts Mixpanel in the root layout. Handles SPA page-view tracking and
// keeps the Mixpanel identity in sync with the Supabase session.
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  React.useEffect(() => {
    initAnalytics();
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) identify(user.id, { email: user.email });
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) identify(session.user.id, { email: session.user.email });
      if (event === "SIGNED_OUT") resetAnalytics();
      if (event === "SIGNED_IN" && typeof window !== "undefined") {
        // OAuth logins redirect away from the page that initiated them; the
        // pending flag is set in auth-form before signInWithOAuth.
        const method = sessionStorage.getItem("mp_auth_pending");
        if (method) {
          sessionStorage.removeItem("mp_auth_pending");
          track("Logged In", { method });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    track("$pageview", { path: pathname });
  }, [pathname]);

  return <>{children}</>;
}
