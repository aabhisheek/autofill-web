import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/server/config";
import { verifySession } from "@/lib/server/session";
import { serverConfig } from "@/lib/server/config";

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request) {
  const token = bearerToken(request);
  const claims = verifySession(token, serverConfig.sessionSecret);
  if (!claims) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: corsHeaders(request) });
  }
  return NextResponse.json(
    { userId: claims.sub, email: claims.email, name: claims.name || "", picture: claims.picture || "" },
    { status: 200, headers: corsHeaders(request) }
  );
}
