import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { countByStatus, getApplications, getEmails, getDefaultResume } from "@/lib/queries";
import { APPLICATION_STATUSES } from "@/lib/types";
import Link from "next/link";

export const metadata = { title: "Overview" };

function formatDate(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default async function DashboardPage() {
  const [apps, emails, resume] = await Promise.all([
    getApplications(200),
    getEmails(5),
    getDefaultResume()
  ]);
  const { total, byStatus } = countByStatus(apps);
  const recent = apps.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">Your pipeline at a glance, synced from the extension.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{total}</CardContent>
        </Card>
        {APPLICATION_STATUSES.map((status) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm capitalize text-muted-foreground">{status}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{byStatus[status]}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent activity</CardTitle>
          <Link href="/dashboard/applications" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No applications yet. Install the Chrome extension and start saving jobs — they will appear here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.title || "Untitled"}</TableCell>
                    <TableCell className="text-muted-foreground">{app.company || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatDate(app.updated_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {resume ? (
              <span>
                <span className="font-medium text-foreground">{resume.title}</span> · updated{" "}
                {new Date(resume.updated_at).toLocaleDateString()}
              </span>
            ) : (
              "No resume on file yet."
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Imported emails</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {emails.length === 0 ? "No confirmation emails imported yet." : `${emails.length} most recent shown in the Emails tab.`}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
