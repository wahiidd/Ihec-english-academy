/**
 * Upcoming events. Add an entry to publish it on both language versions;
 * past events are hidden automatically.
 *
 * Example:
 * {
 *   date: '2026-10-15T14:00:00+01:00',
 *   format: 'hybrid',
 *   title: { en: 'IELTS Speaking workshop', fr: 'Workshop IELTS Speaking' },
 *   description: { en: 'Practise Part 2 of the Speaking test.', fr: 'Entraînez-vous à la partie 2 de l\'épreuve orale.' },
 *   place: { en: 'IHEC Carthage, Room A12', fr: 'IHEC Carthage, salle A12' },
 * },
 */
export type EventFormat = 'onsite' | 'online' | 'hybrid';

export interface AcademyEvent {
  date: string;
  format: EventFormat;
  title: { en: string; fr: string };
  description?: { en: string; fr: string };
  place?: { en: string; fr: string };
}

export const events: AcademyEvent[] = [];
