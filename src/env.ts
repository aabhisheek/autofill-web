// Centralised environment access. Fails loudly at build/start time instead of
// letting a missing key surface as an obscure runtime error in prod.

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
  get serviceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
  get siteUrl() {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` ||
      "http://localhost:3000"
    );
  }
};
