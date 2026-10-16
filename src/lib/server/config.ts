const SESSION_SECRET = process.env.SESSION_SECRET || "dev-only-insecure-session-secret";
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || 30);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "818119178127-m1eibpeh0lqm4jpqe0rea40f720ollcb.apps.googleusercontent.com";
const GOOGLE_TOKENINFO_URL = process.env.GOOGLE_TOKENINFO_URL || "https://oauth2.googleapis.com/tokeninfo";

export const serverConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  sessionSecret: SESSION_SECRET,
  sessionTtlSeconds: SESSION_TTL_DAYS * 24 * 60 * 60,
  googleClientId: GOOGLE_CLIENT_ID,
  googleTokeninfoUrl: GOOGLE_TOKENINFO_URL
};

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // non-browser client
  if (origin.startsWith("chrome-extension://")) return true;
  if ((process.env.NODE_ENV || "development") !== "production") {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || "http://localhost:3000";
  try {
    if (new URL(siteUrl).origin === origin) return true;
  } catch {}
  return false;
}

export function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin");
  const headers: HeadersInit = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization"
  };
  if (origin && isAllowedOrigin(origin)) {
    (headers as Record<string, string>)["Access-Control-Allow-Origin"] = origin;
    (headers as Record<string, string>)["Vary"] = "origin";
  }
  return headers;
}
