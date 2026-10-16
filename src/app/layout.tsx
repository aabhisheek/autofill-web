import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Autofill — your job search, in one place",
    template: "%s · Autofill"
  },
  description:
    "Central dashboard and sync backend for the Job Autofill Chrome extension. Track applications, keep your resume in one place, and sync across every device.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
