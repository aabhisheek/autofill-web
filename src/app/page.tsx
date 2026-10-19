import Link from "next/link";
import { ArrowRight, CloudCog, FileText, LayoutDashboard, Mail, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackLink } from "@/components/track-link";

const features = [
  {
    icon: LayoutDashboard,
    title: "One board, everywhere",
    body: "Your Saved → Applied → Interview → Offer pipeline syncs between the Chrome extension and the web, so the tab you left open and the laptop you switch to agree."
  },
  {
    icon: Mail,
    title: "Applications from your inbox",
    body: "Confirmation emails become cards automatically. The website keeps the same evidence trail the extension used, with the mail that produced each row."
  },
  {
    icon: FileText,
    title: "Resume as data, not a PDF",
    body: "Your resume lives as structured JSON, ready to be tailored per job and rendered to PDF — with the profile block editable in the browser."
  },
  {
    icon: CloudCog,
    title: "A real database",
    body: "Postgres on Supabase with row-level security. Your applications, emails and resume are yours alone, protected by policies, not by trust."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </span>
          Autofill
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <TrackLink href="/login" trackEvent="Landing CTA Clicked" trackProperties={{ cta: "header_login" }}>
              Log in
            </TrackLink>
          </Button>
          <Button asChild>
            <TrackLink href="/signup" trackEvent="Landing CTA Clicked" trackProperties={{ cta: "header_get_started" }}>
              Get started
            </TrackLink>
          </Button>
        </nav>
      </header>

      <main className="container">
        <section className="mx-auto max-w-3xl py-20 text-center sm:py-28">
          <p className="mb-4 inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            The missing backend for your job search
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Your job search, finally in one place
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            A central dashboard for the Job Autofill extension. Applications, resumes and the emails
            behind every card — stored once, synced everywhere.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <TrackLink
                href="/signup"
                trackEvent="Landing CTA Clicked"
                trackProperties={{ cta: "hero_create_dashboard" }}
              >
                Create your dashboard <ArrowRight className="h-4 w-4" />
              </TrackLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <TrackLink
                href="/login"
                trackEvent="Landing CTA Clicked"
                trackProperties={{ cta: "hero_existing_account" }}
              >
                I already have an account
              </TrackLink>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 pb-24 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6 shadow-sm">
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-muted">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Autofill</span>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
