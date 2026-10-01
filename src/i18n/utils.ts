import { en } from './en';
import { fr } from './fr';
import { site } from '../config/site';

export const languages = { en: 'English', fr: 'Français' } as const;
export type Lang = keyof typeof languages;

const dictionaries = { en, fr };

export const t = (lang: Lang) => dictionaries[lang];

export const homePath = (lang: Lang) => (lang === 'en' ? '/' : '/fr/');

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'fr' : 'en');

export const locale = (lang: Lang) => (lang === 'fr' ? 'fr-FR' : 'en-GB');

/** Formats a date in Tunisia's time zone, e.g. "5 October 2026" / "5 octobre 2026". */
export const formatDate = (iso: string, lang: Lang, options: Intl.DateTimeFormatOptions = {}) =>
  new Intl.DateTimeFormat(locale(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Tunis',
    ...options,
  }).format(new Date(iso));

export const launchDateLabel = (lang: Lang) => formatDate(site.launchDate, lang);
