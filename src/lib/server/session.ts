import { createHash, createHmac, timingSafeEqual } from "node:crypto";

function base64url(input: string | Buffer): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(value: string): Buffer {
  const text = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = text + "=".repeat((4 - (text.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

export interface SessionClaims {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  iat?: number;
  exp?: number;
}

export function signSession(claims: Omit<SessionClaims, "iat" | "exp">, secret: string, ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionClaims = {
    ...claims,
    iat: now,
    exp: now + Math.floor(Number(ttlSeconds) || 0)
  };
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const signature = base64url(createHmac("sha256", secret).update(data).digest());
  return `${data}.${signature}`;
}

export function verifySession(token: string | null | undefined, secret: string): SessionClaims | null {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const data = `${header}.${body}`;
  const expected = base64url(createHmac("sha256", secret).update(data).digest());
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length) return null;
  if (!timingSafeEqual(given, wanted)) return null;
  try {
    const payload = JSON.parse(fromBase64url(body).toString("utf8")) as SessionClaims;
    if (!payload || typeof payload !== "object") return null;
    if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
