import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getEmails } from "@/lib/queries";

export const metadata = { title: "Emails" };

function formatDate(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default async function EmailsPage() {
  const emails = await getEmails(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Emails</h1>
        <p className="text-sm text-muted-foreground">
          Confirmation and rejection mails the extension imported to build your board.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Imported messages</CardTitle>
          <CardDescription>{emails.length} most recent</CardDescription>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No emails imported yet. Connect Gmail in the extension and import your inbox.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((mail) => (
                  <TableRow key={mail.id}>
                    <TableCell className="max-w-md">
                      <div className="font-medium">{mail.subject || "(no subject)"}</div>
                      {mail.snippet && (
                        <div className="truncate text-xs text-muted-foreground">{mail.snippet}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mail.from_name || mail.from_address || "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(mail.received_at)}
                    </TableCell>
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
