# Autofill Web

The central dashboard and sync backend for the [Job Autofill Chrome extension](../jobAutofillchromeExtension).

The extension works offline with `chrome.storage`; this app gives that data a home so your
applications, resume and imported emails survive a browser wipe and show up on any device.

## Stack

- **Next.js 15** (App Router, Server Components, Route Handlers) + TypeScript
- **Tailwind CSS** with shadcn/ui-style primitives (in `src/components/ui`)
- **Supabase** — Postgres, Auth and Row Level Security
- Deploy target: **Vercel**

## How it fits together

```
Chrome extension ──(Bearer token)──▶ POST /api/extension/sync ──▶ Supabase (service role)
        ▲                                                              │
        └──────────────────────── pull changed rows ──────────────────┘

Browser ──(Supabase session cookie)──▶ /dashboard ──▶ Supabase (RLS as the user)
```

- The **website** signs users in with Supabase Auth and reads/writes through RLS, so each
  user only ever touches their own rows.
- The **extension** can't hold a web session, so it authenticates with a personal access
  token. `/api/extension/*` resolves the token to a user with the service role and does the
  merge. Only the token's SHA-256 hash is stored.

## Getting started

### 1. Create a Supabase project

At [supabase.com/dashboard](https://supabase.com/dashboard) create a project, then copy
**Project URL**, **anon key** and **service_role key** from Project Settings → API.

### 2. Apply the schema

```bash
# with the Supabase CLI
supabase link --project-ref <your-ref>
supabase db push
```

Or paste `supabase/migrations/0001_init.sql` then `0002_sync.sql` into the SQL editor, in order.

This creates `profiles`, `resumes`, `applications`, `emails`, `user_settings` and
`api_tokens`, enables RLS on all of them, bootstraps a profile/settings/resume row for every
new user, and installs the `sync_apply` merge function.

### 3. Configure auth providers

- **Email**: on by default.
- **Google** (optional): add a Google OAuth client and set the Supabase redirect URL to
  `https://<your-site>/auth/callback`. The extension's existing Google client
  (`src/data/google-oauth.json`) can be reused for the web only if its redirect URIs are
  extended to include this site.

### 4. Run locally

```bash
cp .env.example .env.local   # then fill in the three keys
npm install
npm run dev                  # http://localhost:3000
```

### 5. Deploy to Vercel

Import the repo on Vercel and set the same environment variables
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_SITE_URL`). Point `NEXT_PUBLIC_SITE_URL` at the production domain and add
`https://<domain>/auth/callback` to Supabase's redirect allow-list.

## Connecting the extension

1. Sign in, open **Settings**.
2. **Generate token**, copy it (shown once).
3. In the extension's Options, paste it under **Cloud sync** and press **Sync now**.

The extension stores this token per-install; revoke it from the same page at any time.

## API surface

| Method | Route                 | Auth            | Purpose                        |
| ------ | --------------------- | --------------- | ------------------------------ |
| POST   | `/api/extension/sync` | Bearer token    | Push local board, pull changes |
| GET    | `/api/extension/me`   | Bearer token    | Validate token, return identity |
| GET    | `/api/extension/token`| Supabase cookie | List active tokens             |
| POST   | `/api/extension/token`| Supabase cookie | Mint a token                   |
| DELETE | `/api/extension/token`| Supabase cookie | Revoke a token                 |

### Sync contract

`POST /api/extension/sync` accepts:

```jsonc
{
  "since": 0,                    // ms cursor; 0 returns the whole board
  "applications": [ /* extension rows */ ],
  "emails": [ /* imported mails */ ],
  "resume": { /* profile.json */ }
}
```

and returns the rows changed on the server since `since`, plus `serverTime` to use as the
next cursor. Merges are last-write-wins on the extension's millisecond `updated_at`.

## Project layout

```
src/
  app/
    page.tsx                     landing
    login/ signup/ auth/         auth flow
    dashboard/                   overview, applications, resume, emails, settings
    api/extension/               sync + token endpoints
  components/                    UI primitives and feature components
  lib/
    supabase/{client,server,admin}.ts
    extension-auth.ts            token hashing + bearer resolution
    queries.ts                   server-side data access
    types.ts                     shared row + API types
  env.ts                         validated environment access
supabase/migrations/             schema + sync RPC
```

## Scripts

| Command             | What it does              |
| ------------------- | ------------------------- |
| `npm run dev`       | Dev server                |
| `npm run build`     | Production build          |
| `npm run typecheck` | `tsc --noEmit`            |
| `npm run lint`      | ESLint                    |
| `npm run db:push`   | Push migrations (Supabase CLI) |
