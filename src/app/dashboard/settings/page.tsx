import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">How the extension connects.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connect the extension</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Open the Autofill Chrome extension dashboard/Options.</p>
          <p>2. In the <span className="font-medium text-foreground">Account</span> panel, Sign in with Google (same account you use here).</p>
          <p>3. Set <span className="font-medium text-foreground">Server address</span> to your site base URL (e.g. <code>{process.env.NEXT_PUBLIC_SITE_URL || "https://your-app.vercel.app"}</code>).</p>
          <p>4. Save settings — the extension will sign in and sync through this site.</p>
        </CardContent>
      </Card>
    </div>
  );
}
