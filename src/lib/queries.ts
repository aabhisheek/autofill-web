import { createClient } from "@/lib/supabase/server";
import type { Application, ApplicationStatus, EmailRecord, ProfileRecord, ResumeRecord, UserSettings } from "@/lib/types";

export async function getProfile(): Promise<ProfileRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").maybeSingle();
  return (data as ProfileRecord) ?? null;
}

export async function getDefaultResume(): Promise<ResumeRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as ResumeRecord) ?? null;
}

export async function getApplications(limit = 200): Promise<Application[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return (data as Application[]) ?? [];
}

export async function getEmails(limit = 100): Promise<EmailRecord[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("emails")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(limit);
  return (data as EmailRecord[]) ?? [];
}

export async function getSettings(): Promise<UserSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("user_settings").select("*").maybeSingle();
  return (data as UserSettings) ?? null;
}

export interface StatusCounts {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
}

export function countByStatus(apps: Application[]): StatusCounts {
  const byStatus: Record<ApplicationStatus, number> = {
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  };
  for (const app of apps) {
    if (app.status in byStatus) byStatus[app.status] += 1;
  }
  return { total: apps.length, byStatus };
}
