import { createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Personal access tokens for the Chrome extension. The plaintext is shown to the
// user exactly once; only its SHA-256 hash is persisted, so a database leak does
// not hand over working credentials.
const TOKEN_PREFIX = "jaf_";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function mintToken(): { token: string; hash: string; prefix: string } {
  const token = `${TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
  return { token, hash: hashToken(token), prefix: token.slice(0, 12) };
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

export interface ExtensionPrincipal {
  userId: string;
  tokenId: string;
}

// Resolves a bearer token to a user. Returns null when the token is missing,
// unknown or revoked. Uses the service-role client because the extension has no
// Supabase session of its own.
export async function authenticateExtension(request: Request): Promise<ExtensionPrincipal | null> {
  const token = bearerToken(request);
  if (!token) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("api_tokens")
    .select("id, user_id, revoked_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (!data || data.revoked_at) return null;

  await admin.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);

  return { userId: data.user_id as string, tokenId: data.id as string };
}
