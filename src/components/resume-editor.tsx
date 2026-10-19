"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ProfileRecord, ResumeRecord } from "@/lib/types";

const profileFields: Array<{ key: keyof ProfileRecord; label: string; placeholder?: string }> = [
  { key: "full_name", label: "Full name", placeholder: "Ada Lovelace" },
  { key: "headline", label: "Headline", placeholder: "Senior Backend Engineer" },
  { key: "email", label: "Email", placeholder: "you@example.com" },
  { key: "phone", label: "Phone", placeholder: "+1 555 0100" },
  { key: "location", label: "Location", placeholder: "London, UK" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/…" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/…" }
];

function listFrom(content: Record<string, unknown>, key: string): unknown[] {
  const value = content[key];
  return Array.isArray(value) ? value : [];
}

export function ResumeEditor({
  profile: initialProfile,
  resume
}: {
  profile: ProfileRecord | null;
  resume: ResumeRecord | null;
}) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [form, setForm] = React.useState({
    full_name: initialProfile?.full_name ?? "",
    headline: initialProfile?.headline ?? "",
    email: initialProfile?.email ?? "",
    phone: initialProfile?.phone ?? "",
    location: initialProfile?.location ?? "",
    linkedin: initialProfile?.linkedin ?? "",
    github: initialProfile?.github ?? "",
    summary: initialProfile?.summary ?? ""
  });
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const content = resume?.content ?? {};
  const experience = listFrom(content, "experience");
  const education = listFrom(content, "education");
  const skills = listFrom(content, "skills");

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, ...form }, { onConflict: "user_id" });
    setSaving(false);
    if (error) setError(error.message);
    else {
      track("Profile Saved");
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>The header the extension fills into applications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {profileFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  value={form[field.key as keyof typeof form]}
                  placeholder={field.placeholder}
                  onChange={(e) => set(field.key as keyof typeof form, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              rows={4}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="A short professional summary."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
            {saved && <span className="text-sm text-muted-foreground">Saved.</span>}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Structured resume</CardTitle>
            <CardDescription>
              {resume ? `“${resume.title}” · updated ${new Date(resume.updated_at).toLocaleDateString()}` : "Not available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Section title="Experience" count={experience.length} />
            <Section title="Education" count={education.length} />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">Skills</span>
                <Badge variant="secondary">{skills.length}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 24).map((skill, i) => (
                  <Badge key={i} variant="outline">
                    {typeof skill === "string" ? skill : String((skill as { name?: string })?.name ?? "")}
                  </Badge>
                ))}
                {skills.length === 0 && <span className="text-muted-foreground">No skills parsed yet.</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How it syncs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Your resume lives in the extension as <code className="rounded bg-muted px-1">src/data/profile.json</code>. Sync
            pushes it here so the site can render tailored copies. Editing structured sections from the web is coming; the
            profile block above is already live.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Section({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium">{title}</span>
      <Badge variant="secondary">{count}</Badge>
    </div>
  );
}
