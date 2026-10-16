// Shared types for the central database. These mirror the tables created in
// supabase/migrations/0001_init.sql and the records the Chrome extension
// sends over the /api/extension/* endpoints.

export type ApplicationStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected"
];

export interface MatchRating {
  pct?: number;
  stars?: number;
  shortlist?: number;
  reasons?: string[];
  scoredAt?: number;
}

export interface Application {
  id: string;
  user_id: string;
  url: string;
  title: string;
  company: string;
  source: string;
  status: ApplicationStatus;
  notes: string;
  source_email_id: string;
  match: MatchRating | null;
  saved_at: number;
  applied_at: number | null;
  rejected_at: number | null;
  updated_at: number;
  created_at: string;
}

export interface EmailRecord {
  id: string;
  user_id: string;
  gmail_id: string;
  subject: string;
  from_name: string;
  from_address: string;
  received_at: number;
  snippet: string;
  parsed: Record<string, unknown> | null;
  application_id: string | null;
  created_at: string;
}

export interface ResumeRecord {
  id: string;
  user_id: string;
  title: string;
  is_default: boolean;
  // The extension's profile.json shape, plus any extra sections the site edits.
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProfileRecord {
  user_id: string;
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  data: Record<string, unknown>;
  updated_at: string;
}

// ---- Extension API contracts --------------------------------------------

export interface SyncPushPayload {
  applications: Application[];
  resume?: ResumeRecord["content"] | null;
  emails?: EmailRecord[];
}

export interface SyncResponse {
  ok: boolean;
  serverTime: number;
  received: { applications: number; emails: number };
  // Everything that changed on the server since `since`, for the extension to
  // pull down and merge into its local board.
  applications: Application[];
  resume: ResumeRecord["content"] | null;
  emails: EmailRecord[];
}
