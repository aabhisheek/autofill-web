import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateExtension } from "@/lib/extension-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { APPLICATION_STATUSES } from "@/lib/types";

export const runtime = "nodejs";

const applicationSchema = z.object({
  id: z.string().min(1),
  url: z.string().default(""),
  title: z.string().default(""),
  company: z.string().default(""),
  source: z.string().default(""),
  status: z.enum(APPLICATION_STATUSES as [string, ...string[]]).default("saved"),
  notes: z.string().default(""),
  source_email_id: z.string().default(""),
  match: z.unknown().nullable().optional().default(null),
  saved_at: z.number().default(0),
  applied_at: z.number().nullable().optional().default(null),
  rejected_at: z.number().nullable().optional().default(null),
  updated_at: z.number().default(0)
});

const emailSchema = z.object({
  id: z.string().min(1),
  gmail_id: z.string().default(""),
  subject: z.string().default(""),
  from_name: z.string().default(""),
  from_address: z.string().default(""),
  received_at: z.number().default(0),
  snippet: z.string().default(""),
  parsed: z.unknown().nullable().optional().default(null),
  application_id: z.string().nullable().optional().default(null)
});

const pushSchema = z.object({
  since: z.number().optional().default(0),
  applications: z.array(applicationSchema).max(5000).default([]),
  emails: z.array(emailSchema).max(5000).default([]),
  resume: z.record(z.unknown()).nullable().optional().default(null)
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type"
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  const principal = await authenticateExtension(request);
  if (!principal) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401, headers: CORS });
  }

  let parsed;
  try {
    parsed = pushSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json(
      { error: "bad_request", detail: err instanceof Error ? err.message : String(err) },
      { status: 400, headers: CORS }
    );
  }

  const admin = createAdminClient();
  const userId = principal.userId;

  // 1) Merge the extension's rows in (atomic, last-write-wins on the RPC side).
  const { error: pushError } = await admin.rpc("sync_apply", {
    p_user: userId,
    p_applications: parsed.applications,
    p_emails: parsed.emails
  });
  if (pushError) {
    return NextResponse.json({ error: pushError.message }, { status: 500, headers: CORS });
  }

  // 2) Persist the resume onto the user's default resume row.
  if (parsed.resume) {
    const { data: existing } = await admin
      .from("resumes")
      .select("id")
      .eq("user_id", userId)
      .eq("is_default", true)
      .maybeSingle();

    if (existing) {
      await admin.from("resumes").update({ content: parsed.resume }).eq("id", existing.id);
    } else {
      await admin.from("resumes").insert({ user_id: userId, is_default: true, content: parsed.resume });
    }
  }

  // 3) Pull everything changed since the extension's cursor (0 = full board).
  const since = parsed.since ?? 0;

  const { data: applications } = await admin
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .gt("updated_at", since)
    .order("updated_at", { ascending: false })
    .limit(5000);

  const { data: emails } = await admin
    .from("emails")
    .select("*")
    .eq("user_id", userId)
    .gt("received_at", since)
    .order("received_at", { ascending: false })
    .limit(5000);

  const { data: resumeRow } = await admin
    .from("resumes")
    .select("content")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  return NextResponse.json(
    {
      ok: true,
      serverTime: Date.now(),
      received: { applications: parsed.applications.length, emails: parsed.emails.length },
      applications: applications ?? [],
      emails: emails ?? [],
      resume: resumeRow?.content ?? null
    },
    { headers: CORS }
  );
}
