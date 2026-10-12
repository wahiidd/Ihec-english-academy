import postgres from 'postgres';
import { DATABASE_URL } from 'astro:env/server';

export interface Registration {
  id: string;
  event_slug: string;
  ticket_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  study_level: string;
  lang: 'en' | 'fr';
  created_at: Date;
  checked_in_at: Date | null;
}

let client: postgres.Sql | undefined;

export const db = () => {
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');
  client ??= postgres(DATABASE_URL, {
    // Supabase's transaction pooler does not support prepared statements.
    prepare: false,
    ssl: /localhost|127\.0\.0\.1/.test(DATABASE_URL) ? false : 'require',
    max: 1,
    idle_timeout: 20,
  });
  return client;
};

export const countsByEvent = async () => {
  const rows = await db()<{ event_slug: string; taken: number; checked_in: number }[]>`
    select event_slug, count(*)::int as taken, count(checked_in_at)::int as checked_in
    from registrations group by event_slug`;
  return new Map(rows.map((r) => [r.event_slug, r]));
};

export const registerAttendee = async (p: {
  event: string;
  capacity: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  level: string;
  lang: string;
}) => {
  const [row] = await db()<{ out_status: 'ok' | 'duplicate' | 'full'; out_code: string | null; out_remaining: number }[]>`
    select * from register_attendee(${p.event}, ${p.capacity}, ${p.code}, ${p.firstName}, ${p.lastName},
      ${p.email}, ${p.phone}, ${p.level}, ${p.lang})`;
  return row;
};

export const findByCode = async (code: string) => {
  const [row] = await db()<Registration[]>`select * from registrations where ticket_code = ${code}`;
  return row;
};

export const listRegistrations = (event: string) =>
  db()<Registration[]>`select * from registrations where event_slug = ${event} order by created_at`;

/** Marks attendance once. Returns the registration and whether it had already been scanned. */
export const checkIn = async (code: string) => {
  const [updated] = await db()<Registration[]>`
    update registrations set checked_in_at = now()
    where ticket_code = ${code} and checked_in_at is null
    returning *`;
  if (updated) return { status: 'ok' as const, registration: updated };
  const existing = await findByCode(code);
  if (existing) return { status: 'already' as const, registration: existing };
  return { status: 'invalid' as const };
};
