-- ============================================================================
-- Job Autofill — central schema
--
-- One Supabase project backs both the website and the Chrome extension. Every
-- table is scoped to a user and protected by Row Level Security, so the anon
-- key shipped to the browser (and used by the extension once it holds a user
-- session) can only ever touch the signed-in user's rows.
--
-- The extension talks to the server through /api/extension/*, which authenticates
-- with a personal access token and uses the service role — that path bypasses RLS
-- by design, and the route handlers are what enforce ownership.
--
-- Timestamps that originate in the extension are epoch milliseconds (bigint),
-- because that is what chrome.storage already stores. created_at fields are
-- timestamptz for server-side auditing.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles — the resume header / identity block.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  headline    text not null default '',
  email       text not null default '',
  phone       text not null default '',
  location    text not null default '',
  linkedin    text not null default '',
  github      text not null default '',
  summary     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- resumes — the full structured resume. `content` is a JSON document shaped
-- like the extension's profile.json (experience, education, projects, skills…),
-- kept flexible so new sections need no migration.
-- ---------------------------------------------------------------------------
create table if not exists public.resumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'Default resume',
  is_default  boolean not null default false,
  content     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists resumes_user_idx on public.resumes(user_id, updated_at desc);

-- Only one default resume per user.
create unique index if not exists resumes_one_default
  on public.resumes(user_id) where is_default;

-- ---------------------------------------------------------------------------
-- applications — the tracker board. Mirrors Tracker's row shape exactly; the
-- extension pushes/pulls these by (user_id, id).
-- ---------------------------------------------------------------------------
create table if not exists public.applications (
  user_id         uuid not null references auth.users(id) on delete cascade,
  id              text not null,
  url             text not null default '',
  title           text not null default '',
  company         text not null default '',
  source          text not null default '',
  status          text not null default 'saved'
                    check (status in ('saved','applied','interview','offer','rejected')),
  notes           text not null default '',
  source_email_id text not null default '',
  match           jsonb,
  saved_at        bigint not null default 0,
  applied_at      bigint,
  rejected_at     bigint,
  updated_at      bigint not null default 0,
  created_at      timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists applications_user_updated_idx on public.applications(user_id, updated_at desc);
create index if not exists applications_user_status_idx on public.applications(user_id, status);
create index if not exists applications_user_source_email_idx on public.applications(user_id, source_email_id);

-- ---------------------------------------------------------------------------
-- emails — the imported confirmation mails behind each card, so the site shows
-- the same evidence the extension used.
-- ---------------------------------------------------------------------------
create table if not exists public.emails (
  user_id        uuid not null references auth.users(id) on delete cascade,
  id             text not null,
  gmail_id       text not null default '',
  subject        text not null default '',
  from_name      text not null default '',
  from_address   text not null default '',
  received_at    bigint not null default 0,
  snippet        text not null default '',
  parsed         jsonb,
  application_id text,
  created_at     timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists emails_user_received_idx on public.emails(user_id, received_at desc);

-- ---------------------------------------------------------------------------
-- user_settings — non-secret preferences (discovery roles, sync cadence, theme).
-- API keys deliberately do NOT live here; they stay in the extension or in a
-- server-side vault.
-- ---------------------------------------------------------------------------
create table if not exists public.user_settings (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- api_tokens — personal access tokens for the extension. Only the SHA-256 hash
-- of the token is stored; the plaintext is shown once, at creation.
-- ---------------------------------------------------------------------------
create table if not exists public.api_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null default 'Chrome extension',
  token_hash   text not null unique,
  prefix       text not null default '',
  last_used_at timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists api_tokens_user_idx on public.api_tokens(user_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.resumes       enable row level security;
alter table public.applications  enable row level security;
alter table public.emails        enable row level security;
alter table public.user_settings enable row level security;
alter table public.api_tokens    enable row level security;

do $$
begin
  -- profiles
  create policy "profiles owner select" on public.profiles for select using (auth.uid() = user_id);
  create policy "profiles owner upsert" on public.profiles for insert with check (auth.uid() = user_id);
  create policy "profiles owner update" on public.profiles for update using (auth.uid() = user_id);
  create policy "profiles owner delete" on public.profiles for delete using (auth.uid() = user_id);

  -- resumes
  create policy "resumes owner select" on public.resumes for select using (auth.uid() = user_id);
  create policy "resumes owner insert" on public.resumes for insert with check (auth.uid() = user_id);
  create policy "resumes owner update" on public.resumes for update using (auth.uid() = user_id);
  create policy "resumes owner delete" on public.resumes for delete using (auth.uid() = user_id);

  -- applications
  create policy "applications owner select" on public.applications for select using (auth.uid() = user_id);
  create policy "applications owner insert" on public.applications for insert with check (auth.uid() = user_id);
  create policy "applications owner update" on public.applications for update using (auth.uid() = user_id);
  create policy "applications owner delete" on public.applications for delete using (auth.uid() = user_id);

  -- emails
  create policy "emails owner select" on public.emails for select using (auth.uid() = user_id);
  create policy "emails owner insert" on public.emails for insert with check (auth.uid() = user_id);
  create policy "emails owner update" on public.emails for update using (auth.uid() = user_id);
  create policy "emails owner delete" on public.emails for delete using (auth.uid() = user_id);

  -- user_settings
  create policy "settings owner select" on public.user_settings for select using (auth.uid() = user_id);
  create policy "settings owner insert" on public.user_settings for insert with check (auth.uid() = user_id);
  create policy "settings owner update" on public.user_settings for update using (auth.uid() = user_id);
  create policy "settings owner delete" on public.user_settings for delete using (auth.uid() = user_id);

  -- api_tokens (the extension's service-role path bypasses these)
  create policy "tokens owner select" on public.api_tokens for select using (auth.uid() = user_id);
  create policy "tokens owner insert" on public.api_tokens for insert with check (auth.uid() = user_id);
  create policy "tokens owner delete" on public.api_tokens for delete using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ============================================================================
-- updated_at maintenance
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists resumes_touch on public.resumes;
create trigger resumes_touch before update on public.resumes
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.user_settings;
create trigger settings_touch before update on public.user_settings
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- New-user bootstrap: give every account a profile, an empty default resume
-- and a settings row, so the app never has to special-case "first login".
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, email)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.email, ''))
    on conflict (user_id) do nothing;

  insert into public.user_settings (user_id) values (new.id)
    on conflict (user_id) do nothing;

  insert into public.resumes (user_id, title, is_default)
    values (new.id, 'Default resume', true)
    on conflict do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
