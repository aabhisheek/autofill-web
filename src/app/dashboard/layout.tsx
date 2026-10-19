import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/sidebar-nav";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectedFrom=/dashboard");

  return (
    <div className="min-h-screen sm:grid sm:grid-cols-[240px_1fr]">
      <aside className="border-b bg-muted/30 sm:border-b-0 sm:border-r">
        <div className="flex h-16 items-center gap-2 px-5 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </span>
          Autofill
        </div>
        <div className="px-3 pb-4 sm:pb-6">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b px-5">
          <div className="truncate text-sm text-muted-foreground">{user.email}</div>
          <SignOutButton />
        </header>
        <main className="flex-1 px-5 py-6">{children}</main>
        <footer className="border-t px-5 py-4 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← Back to homepage
          </Link>
        </footer>
      </div>
    </div>
  );
}
