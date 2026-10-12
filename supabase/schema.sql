-- IHEC English Academy — event registrations.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

create table if not exists registrations (
  id            uuid primary key default gen_random_uuid(),
  event_slug    text        not null,
  ticket_code   text        not null unique,
  first_name    text        not null,
  last_name     text        not null,
  email         text        not null,
  phone         text        not null,
  study_level   text        not null,
  lang          text        not null default 'fr',
  created_at    timestamptz not null default now(),
  checked_in_at timestamptz
);

-- One registration per e-mail and per event.
create unique index if not exists registrations_event_email_key
  on registrations (event_slug, lower(email));

-- The table is only reached by the site's server (direct Postgres connection);
-- RLS with no policy keeps it closed to Supabase's public REST API.
alter table registrations enable row level security;

-- Registers an attendee unless the event is full. The advisory lock serialises
-- concurrent sign-ups for the same event, so the capacity can never be exceeded.
create or replace function register_attendee(
  p_event text, p_capacity int, p_code text,
  p_first text, p_last text, p_email text, p_phone text, p_level text, p_lang text
)
returns table (out_status text, out_code text, out_remaining int)
language plpgsql
as $$
declare
  v_taken int;
  v_existing text;
begin
  perform pg_advisory_xact_lock(hashtext(p_event));

  select count(*) into v_taken from registrations r where r.event_slug = p_event;

  select r.ticket_code into v_existing
  from registrations r
  where r.event_slug = p_event and lower(r.email) = lower(p_email);

  if v_existing is not null then
    return query select 'duplicate'::text, v_existing, greatest(p_capacity - v_taken, 0);
    return;
  end if;

  if v_taken >= p_capacity then
    return query select 'full'::text, null::text, 0;
    return;
  end if;

  insert into registrations (event_slug, ticket_code, first_name, last_name, email, phone, study_level, lang)
  values (p_event, p_code, p_first, p_last, lower(p_email), p_phone, p_level, p_lang);

  return query select 'ok'::text, p_code, p_capacity - v_taken - 1;
end;
$$;
