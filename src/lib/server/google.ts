export interface GoogleIdentity {
  userId: string;
  email: string;
  name: string;
  picture: string;
}

export interface VerifyGoogleOptions {
  clientId?: string;
  tokeninfoUrl?: string;
  fetchImpl?: typeof fetch;
}

const DEFAULT_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";
const DEFAULT_GOOGLE_CLIENT_ID = "818119178127-m1eibpeh0lqm4jpqe0rea40f720ollcb.apps.googleusercontent.com";

export async function verifyGoogleIdToken(
  idToken: unknown,
  options: VerifyGoogleOptions = {}
): Promise<GoogleIdentity> {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("missing id token");
  }
  const tokeninfoUrl = options.tokeninfoUrl || DEFAULT_TOKENINFO_URL;
  const url = `${tokeninfoUrl}?id_token=${encodeURIComponent(idToken)}`;
  const fetchImpl = options.fetchImpl || fetch;
  let res: Response;
  try {
    res = await fetchImpl(url);
  } catch {
    throw new Error("could not reach Google to verify the token");
  }
  if (!res.ok) {
    throw new Error(`Google rejected the token (${res.status})`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const clientId = options.clientId || DEFAULT_GOOGLE_CLIENT_ID;
  if (clientId && data.aud !== clientId) {
    throw new Error("token was issued for a different client");
  }
  if (data.email_verified === "false" || data.email_verified === false) {
    throw new Error("email is not verified");
  }
  if (!data.sub || !data.email) {
    throw new Error("token is missing the subject or email");
  }
  const exp = typeof data.exp === "string" ? Number(data.exp) * 1000 : (data.exp as number) * 1000;
  if (Number.isFinite(exp) && exp > 0 && exp < Date.now()) {
    throw new Error("token has expired");
  }
  return {
    userId: String(data.sub),
    email: String(data.email),
    name: String(data.name || ""),
    picture: String(data.picture || "")
  };
}
