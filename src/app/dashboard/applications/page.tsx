import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { getApplications } from "@/lib/queries";
import { APPLICATION_STATUSES } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = { title: "Applications" };

function formatDate(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default async function ApplicationsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const all = await getApplications(500);
  const active = status && APPLICATION_STATUSES.includes(status as never) ? status : undefined;
  const apps = active ? all.filter((a) => a.status === active) : all;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground">{apps.length} shown</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/applications"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              !active ? "bg-secondary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </Link>
          {APPLICATION_STATUSES.map((s) => (
            <Link
              key={s}
              href={`/dashboard/applications?status=${s}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium capitalize",
                active === s ? "bg-secondary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="sr-only">
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {apps.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      {app.url ? (
                        <a href={app.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {app.title || "Untitled"}
                        </a>
                      ) : (
                        app.title || "Untitled"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{app.company || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{app.source || "—"}</TableCell>
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
    </div>
  );
}
