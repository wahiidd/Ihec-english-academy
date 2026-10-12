/**
 * Events shown on both language versions. Past events are hidden automatically.
 *
 * - `registration` turns on sign-ups: a capacity, and optionally `closesAt`
 *   (default: the end of the day before the event, Tunis time).
 *   Registrations also close as soon as the capacity is reached.
 * - `showTime: false` displays the date only (for announcements without a public time).
 */
export type EventFormat = 'onsite' | 'online' | 'hybrid';

export interface AcademyEvent {
  slug: string;
  date: string;
  showTime?: boolean;
  format: EventFormat;
  title: { en: string; fr: string };
  description?: { en: string; fr: string };
  place?: { en: string; fr: string };
  /** Short note displayed instead of a registration button. */
  note?: { en: string; fr: string };
  registration?: { capacity: number; closesAt?: string };
}

export const events: AcademyEvent[] = [
  {
    slug: 'british-council-partnership',
    date: '2026-11-03T00:00:00+01:00',
    showTime: false,
    format: 'onsite',
    title: {
      en: 'Partnership signing with the British Council',
      fr: 'Signature du partenariat avec le British Council',
    },
    description: {
      en: 'IHEC English Academy and the British Council formalise their partnership.',
      fr: 'L’IHEC English Academy et le British Council officialisent leur partenariat.',
    },
    place: { en: 'IHEC Carthage', fr: 'IHEC Carthage' },
    note: { en: 'Announcement — not open to the public', fr: 'Annonce — événement non ouvert au public' },
  },
  {
    slug: 'info-session-2026',
    date: '2026-11-11T10:00:00+01:00',
    format: 'onsite',
    title: { en: 'Info session', fr: 'Session d’information' },
    description: {
      en: 'Discover the academy: activities, IELTS preparation, membership and the programme of the year.',
      fr: 'Découvrez l’académie : activités, préparation à l’IELTS, adhésion et programme de l’année.',
    },
    place: { en: 'IHEC Carthage, Amphi 2', fr: 'IHEC Carthage, Amphi 2' },
    registration: { capacity: 150 },
  },
];

export const findEvent = (slug: string) => events.find((e) => e.slug === slug);

/** End of the day before the event (Tunis time, UTC+1), unless set explicitly. */
export const closesAt = (event: AcademyEvent): string => {
  if (event.registration?.closesAt) return event.registration.closesAt;
  const day = event.date.slice(0, 10);
  return `${day}T00:00:00+01:00`;
};

export const registrationOpen = (event: AcademyEvent, now = Date.now()) =>
  Boolean(event.registration) && now < Date.parse(closesAt(event));

export const STUDY_LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'] as const;

const LEVEL_LABELS: Record<string, string> = {
  L1: '1re année licence',
  L2: '2e année licence',
  L3: '3e année licence',
  M1: '1re année master',
  M2: '2e année master',
};

/** Readable level for the admin area and exports ("Autre : …" values are kept as entered). */
export const levelLabel = (level: string) => LEVEL_LABELS[level] ?? level;
