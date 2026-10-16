-- ============================================================================
-- Atomic sync merge.
--
-- The extension POSTs its local board to /api/extension/sync. The route hands
-- the payload here so the merge is a single round-trip with last-write-wins
-- semantics keyed on the extension's own millisecond clocks. Using an RPC keeps
-- the merge atomic and avoids N round-trips from Node.
--
-- Called with the service role, so it bypasses RLS; the route is responsible for
-- having resolved p_user from the bearer token first.
-- ============================================================================

create or replace function public.sync_apply(
  p_user uuid,
  p_applications jsonb default '[]'::jsonb,
  p_emails jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.applications (
    user_id, id, url, title, company, source, status, notes,
    source_email_id, match, saved_at, applied_at, rejected_at, updated_at
  )
  select
    p_user, x.id, coalesce(x.url, ''), coalesce(x.title, ''), coalesce(x.company, ''),
    coalesce(x.source, ''), coalesce(x.status, 'saved'), coalesce(x.notes, ''),
    coalesce(x.source_email_id, ''), x.match, coalesce(x.saved_at, 0),
    x.applied_at, x.rejected_at, coalesce(x.updated_at, 0)
  from jsonb_to_recordset(p_applications) as x(
    id text, url text, title text, company text, source text, status text,
    notes text, source_email_id text, match jsonb,
    saved_at bigint, applied_at bigint, rejected_at bigint, updated_at bigint
  )
  where x.id is not null
  on conflict (user_id, id) do update set
    url             = excluded.url,
    title           = excluded.title,
    company         = excluded.company,
    source          = excluded.source,
    status          = excluded.status,
    notes           = excluded.notes,
    source_email_id = excluded.source_email_id,
    match           = excluded.match,
    saved_at        = excluded.saved_at,
    applied_at      = excluded.applied_at,
    rejected_at     = excluded.rejected_at,
    updated_at      = excluded.updated_at
  where excluded.updated_at >= public.applications.updated_at;

  insert into public.emails (
    user_id, id, gmail_id, subject, from_name, from_address,
    received_at, snippet, parsed, application_id
  )
  select
    p_user, x.id, coalesce(x.gmail_id, ''), coalesce(x.subject, ''),
    coalesce(x.from_name, ''), coalesce(x.from_address, ''),
    coalesce(x.received_at, 0), coalesce(x.snippet, ''), x.parsed, x.application_id
  from jsonb_to_recordset(p_emails) as x(
    id text, gmail_id text, subject text, from_name text, from_address text,
    received_at bigint, snippet text, parsed jsonb, application_id text
  )
  where x.id is not null
  on conflict (user_id, id) do update set
    gmail_id       = excluded.gmail_id,
    subject        = excluded.subject,
    from_name      = excluded.from_name,
    from_address   = excluded.from_address,
    received_at    = excluded.received_at,
    snippet        = excluded.snippet,
    parsed         = excluded.parsed,
    application_id = excluded.application_id
  where excluded.received_at >= public.emails.received_at;
end $$;

revoke all on function public.sync_apply(uuid, jsonb, jsonb) from public, anon, authenticated;
