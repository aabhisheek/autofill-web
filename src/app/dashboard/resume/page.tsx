import { ResumeEditor } from "@/components/resume-editor";
import { getDefaultResume, getProfile } from "@/lib/queries";

export const metadata = { title: "Resume" };

export default async function ResumePage() {
  const [profile, resume] = await Promise.all([getProfile(), getDefaultResume()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
        <p className="text-sm text-muted-foreground">Keep your profile and structured resume in one place.</p>
      </div>
      <ResumeEditor profile={profile} resume={resume} />
    </div>
  );
}
