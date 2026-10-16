import { NextResponse } from "next/server";
import { authenticateExtension } from "@/lib/extension-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Identity probe for the extension. A 200 here means the stored token is valid
// and the sync endpoints can be used.
export async function GET(request: Request) {
  const principal = await authenticateExtension(request);
  if (!principal) return NextResponse.json({ error: "invalid_token" }, { status: 401 });

  const admin = createAdminClient();
  const { data: user } = await admin.auth.admin.getUserById(principal.userId);

  const { count } = await admin
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", principal.userId);

  return NextResponse.json({
    ok: true,
    user: { id: principal.userId, email: user?.user?.email ?? null },
    applications: count ?? 0
  });
}
