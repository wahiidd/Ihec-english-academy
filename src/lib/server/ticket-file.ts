import type { AcademyEvent } from '../../data/events';
import type { Lang } from '../../i18n/utils';
import { ticketPdf } from './ticket-pdf';
import { checkInUrl, qrPng } from './tickets';

let logo: Uint8Array | undefined;

/** The logo is a static file: fetch it once from the running site and keep it in memory. */
const loadLogo = async (origin: string) => {
  if (logo) return logo;
  try {
    const res = await fetch(new URL('/images/logo-full.png', origin));
    if (res.ok) logo = new Uint8Array(await res.arrayBuffer());
  } catch {
    // Without the logo the PDF falls back to a typeset wordmark.
  }
  return logo;
};

export const ticketFileName = (event: AcademyEvent, lang: Lang) =>
  `${lang === 'fr' ? 'billet' : 'ticket'}-${event.slug}.pdf`;

export const buildTicketPdf = async (p: {
  site: URL;
  origin: string;
  lang: Lang;
  firstName: string;
  lastName: string;
  code: string;
  event: AcademyEvent;
}) =>
  ticketPdf({
    lang: p.lang,
    firstName: p.firstName,
    lastName: p.lastName,
    code: p.code,
    event: p.event,
    qrPng: new Uint8Array(await qrPng(checkInUrl(p.site, p.code), 600)),
    logoPng: await loadLogo(p.origin),
  });
