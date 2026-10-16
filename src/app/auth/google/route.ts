import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/server/config";
import { verifyGoogleIdToken } from "@/lib/server/google";
import { signSession } from "@/lib/server/session";
import { serverConfig } from "@/lib/server/config";
import { createAdminClient } from "@/lib/supabase/admin";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { idToken?: string };
    const idToken = body?.idToken;
    let identity;
    try {
      identity = await verifyGoogleIdToken(idToken, {
        clientId: serverConfig.googleClientId,
        tokeninfoUrl: serverConfig.googleTokeninfoUrl
      });
    } catch (err) {
      return NextResponse.json(
        { error: "invalid_google_token", detail: err instanceof Error ? err.message : String(err) },
        { status: 401, headers: corsHeaders(request) }
      );
    }

    const admin = createAdminClient();
    let userId = identity.userId;
    // Try to find by email; if not exists, create a user in auth.users
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 10 });
    const existingUser = list?.users?.find((u) => u.email?.toLowerCase() === identity.email.toLowerCase());
    if (existingUser?.id) {
      userId = existingUser.id;
    } else {
      const { data: created } = await admin.auth.admin.createUser({
        email: identity.email,
        email_confirm: true,
        user_metadata: { full_name: identity.name, google_sub: identity.userId }
      });
      if (created?.user?.id) {
        userId = created.user.id;
      }
    }

    const expiresAt = Date.now() + serverConfig.sessionTtlSeconds * 1000;
    const token = signSession(
      { sub: userId, email: identity.email, name: identity.name, picture: identity.picture },
      serverConfig.sessionSecret,
      serverConfig.sessionTtlSeconds
    );

    return NextResponse.json(
      { token, userId, email: identity.email, name: identity.name, picture: identity.picture, expiresAt },
      { status: 200, headers: corsHeaders(request) }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "bad_request", detail: err instanceof Error ? err.message : String(err) },
      { status: 400, headers: corsHeaders(request) }
    );
  }
}
