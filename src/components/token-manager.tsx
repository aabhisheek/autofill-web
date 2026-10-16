"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TokenRow {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
}

function formatWhen(value: string | null) {
  if (!value) return "never";
  return new Date(value).toLocaleString();
}

export function TokenManager({ initialTokens }: { initialTokens: TokenRow[] }) {
  const router = useRouter();
  const [tokens, setTokens] = React.useState(initialTokens);
  const [name, setName] = React.useState("");
  const [fresh, setFresh] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/extension/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name || "Chrome extension" })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not create token");
      setFresh(json.token as string);
      setTokens((prev) => [
        { id: json.id, name: json.name, prefix: json.prefix, created_at: json.created_at, last_used_at: null },
        ...prev
      ]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/extension/token?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not revoke token");
      setTokens((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect the extension</CardTitle>
          <CardDescription>
            Create a token, then paste it into the Autofill extension&apos;s Options page. Treat it like a password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="token-name">Label</Label>
              <Input
                id="token-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My laptop"
                className="w-56"
              />
            </div>
            <Button onClick={create} disabled={busy}>
              Generate token
            </Button>
          </div>

          {fresh && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium">Copy this token now — it won&apos;t be shown again.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded bg-background px-2 py-1 text-xs">{fresh}</code>
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(fresh)}>
                  Copy
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active tokens</CardTitle>
          <CardDescription>{tokens.length} token{tokens.length === 1 ? "" : "s"}</CardDescription>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No tokens yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">{token.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{token.prefix}…</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatWhen(token.created_at)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatWhen(token.last_used_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => revoke(token.id)} disabled={busy}>
                        Revoke
                      </Button>
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
