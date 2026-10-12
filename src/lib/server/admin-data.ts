import { events, levelLabel, type AcademyEvent } from '../../data/events';
import { formatDate } from '../../i18n/utils';
import { listRegistrations, type Registration } from './db';

/** Events with registrations: upcoming first (soonest on top), then past ones (most recent first). */
export const adminEvents = () => {
  const now = Date.now();
  const withReg = events.filter((e) => e.registration);
  const upcoming = withReg.filter((e) => Date.parse(e.date) >= now - 86_400_000).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const past = withReg.filter((e) => Date.parse(e.date) < now - 86_400_000).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return [...upcoming, ...past];
};

export const eventLabel = (e: AcademyEvent) =>
  `${e.title.fr} — ${formatDate(e.date, 'fr', { weekday: 'short', ...(e.showTime === false ? {} : { hour: '2-digit', minute: '2-digit' }) })}`;

export interface SheetRow {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  level: string;
  /** Stored value (L1…M2 or "Autre : …"), used by the edit form. */
  levelRaw: string;
  createdAt: string;
  checkedInAt: string | null;
}

const toRow = (r: Registration): SheetRow => ({
  code: r.ticket_code,
  firstName: r.first_name,
  lastName: r.last_name,
  email: r.email,
  phone: r.phone,
  level: levelLabel(r.study_level),
  levelRaw: r.study_level,
  createdAt: r.created_at.toISOString(),
  checkedInAt: r.checked_in_at?.toISOString() ?? null,
});

export const sheet = async (event: AcademyEvent) => {
  const rows = (await listRegistrations(event.slug)).map(toRow);
  const capacity = event.registration!.capacity;
  const present = rows.filter((r) => r.checkedInAt).length;
  return {
    event: { slug: event.slug, title: event.title.fr, label: eventLabel(event), capacity },
    stats: { registered: rows.length, present, pending: rows.length - present, remaining: Math.max(capacity - rows.length, 0) },
    rows,
  };
};

export type Sheet = Awaited<ReturnType<typeof sheet>>;
