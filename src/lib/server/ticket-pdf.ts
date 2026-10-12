import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { AcademyEvent } from '../../data/events';
import { formatDate, type Lang } from '../../i18n/utils';

const NAVY = rgb(15 / 255, 42 / 255, 92 / 255);
const TEAL = rgb(26 / 255, 122 / 255, 114 / 255);
const MUTED = rgb(74 / 255, 88 / 255, 114 / 255);
const LINE = rgb(220 / 255, 229 / 255, 238 / 255);
const SOFT = rgb(243 / 255, 247 / 255, 250 / 255);

const copy = {
  en: { kicker: 'YOUR TICKET', holder: 'NAME', date: 'DATE', time: 'TIME', place: 'PLACE', number: 'Ticket', help: 'Show this QR code at the entrance — on your phone or printed.' },
  fr: { kicker: 'VOTRE BILLET', holder: 'NOM', date: 'DATE', time: 'HEURE', place: 'LIEU', number: 'Billet', help: 'Présentez ce QR code à l’entrée — sur votre téléphone ou imprimé.' },
};

/** Standard PDF fonts only cover Latin-1; drop characters they cannot encode instead of failing. */
const safe = (font: PDFFont, text: string) =>
  [...text]
    .map((ch) => {
      try {
        font.encodeText(ch);
        return ch;
      } catch {
        return '?';
      }
    })
    .join('');

const wrap = (font: PDFFont, text: string, size: number, maxWidth: number) => {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
};

const centered = (page: PDFPage, font: PDFFont, text: string, size: number, y: number, color = NAVY) => {
  const t = safe(font, text);
  page.drawText(t, { x: (page.getWidth() - font.widthOfTextAtSize(t, size)) / 2, y, size, font, color });
};

export interface TicketPdf {
  lang: Lang;
  firstName: string;
  lastName: string;
  code: string;
  event: AcademyEvent;
  qrPng: Uint8Array;
  logoPng?: Uint8Array;
}

export const ticketPdf = async (t: TicketPdf) => {
  const c = copy[t.lang];
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${c.number} — ${t.event.title[t.lang]}`);
  pdf.setAuthor('IHEC English Academy');

  const page = pdf.addPage([420, 595]); // A5 portrait
  const W = page.getWidth();
  const M = 36;
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  page.drawRectangle({ x: 0, y: 0, width: W, height: 595, color: SOFT });
  page.drawRectangle({ x: 18, y: 18, width: W - 36, height: 559, color: rgb(1, 1, 1), borderColor: LINE, borderWidth: 1 });
  page.drawRectangle({ x: 18, y: 571, width: W - 36, height: 6, color: NAVY });

  let y = 560;
  if (t.logoPng) {
    const logo = await pdf.embedPng(t.logoPng);
    const w = 130;
    const h = (logo.height / logo.width) * w;
    y -= h + 8;
    page.drawImage(logo, { x: (W - w) / 2, y, width: w, height: h });
  } else {
    y -= 30;
    centered(page, serif, 'IHEC English Academy', 20, y);
  }

  y -= 26;
  page.drawText(c.kicker, { x: M, y, size: 9, font: bold, color: TEAL });
  y -= 24;
  for (const line of wrap(serif, safe(serif, t.event.title[t.lang]), 22, W - 2 * M)) {
    page.drawText(line, { x: M, y, size: 22, font: serif, color: NAVY });
    y -= 26;
  }

  const rows: [string, string][] = [
    [c.holder, `${t.firstName} ${t.lastName}`],
    [c.date, formatDate(t.event.date, t.lang, { weekday: 'long' })],
  ];
  if (t.event.showTime !== false) {
    rows.push([c.time, formatDate(t.event.date, t.lang, { day: undefined, month: undefined, year: undefined, hour: '2-digit', minute: '2-digit' })]);
  }
  if (t.event.place) rows.push([c.place, t.event.place[t.lang]]);

  y -= 2;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.5, color: NAVY });
  for (const [label, value] of rows) {
    y -= 19;
    page.drawText(label, { x: M, y, size: 8.5, font: bold, color: MUTED });
    const v = safe(bold, value);
    const size = bold.widthOfTextAtSize(v, 11) > W - 2 * M - 70 ? 9.5 : 11;
    page.drawText(v, { x: W - M - bold.widthOfTextAtSize(v, size), y, size, font: bold, color: NAVY });
    y -= 10;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: LINE });
  }

  // Tear line with notches.
  y -= 16;
  page.drawLine({ start: { x: 30, y }, end: { x: W - 30, y }, thickness: 1, color: LINE, dashArray: [5, 4] });
  page.drawCircle({ x: 18, y, size: 9, color: SOFT });
  page.drawCircle({ x: W - 18, y, size: 9, color: SOFT });

  const qr = await pdf.embedPng(t.qrPng);
  const q = 150;
  y -= q + 14;
  page.drawImage(qr, { x: (W - q) / 2, y, width: q, height: q });

  y -= 18;
  centered(page, mono, `${c.number} ${t.code.slice(0, 8).toUpperCase()}`, 11, y, MUTED);
  y -= 18;
  for (const line of wrap(regular, safe(regular, c.help), 9.5, W - 2 * M - 20)) {
    centered(page, regular, line, 9.5, y, MUTED);
    y -= 13;
  }

  page.drawLine({ start: { x: M, y: 44 }, end: { x: W - M, y: 44 }, thickness: 0.6, color: LINE });
  centered(page, regular, 'IHEC English Academy · Communicate • Lead • Succeed · IHEC Carthage', 7.5, 30, MUTED);

  return pdf.save();
};
