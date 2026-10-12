import type { AcademyEvent } from '../../data/events';
import { formatDate, type Lang } from '../../i18n/utils';

const copy = {
  en: {
    subject: (title: string) => `Your ticket — ${title}`,
    preheader: (title: string) => `Your place is confirmed. Show your QR code at the entrance of ${title}.`,
    badge: 'Registration confirmed',
    hello: (name: string) => `Hello ${name},`,
    intro: 'Your place is booked. Here is your ticket for:',
    date: 'Date',
    time: 'Time',
    place: 'Place',
    qrHelp: 'Show this QR code at the entrance — on your phone or printed.',
    download: 'Download my ticket',
    cancel: 'Can’t make it anymore? Just reply to this e-mail so we can free your seat for someone else.',
    ticketNo: 'Ticket',
  },
  fr: {
    subject: (title: string) => `Votre billet — ${title}`,
    preheader: (title: string) => `Votre place est confirmée. Présentez votre QR code à l’entrée de : ${title}.`,
    badge: 'Inscription confirmée',
    hello: (name: string) => `Bonjour ${name},`,
    intro: 'Votre place est réservée. Voici votre billet pour :',
    date: 'Date',
    time: 'Heure',
    place: 'Lieu',
    qrHelp: 'Présentez ce QR code à l’entrée — sur votre téléphone ou imprimé.',
    download: 'Télécharger mon billet',
    cancel: 'Vous ne pouvez plus venir ? Répondez simplement à cet e-mail pour libérer votre place.',
    ticketNo: 'Billet',
  },
};

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export interface TicketEmail {
  lang: Lang;
  firstName: string;
  lastName: string;
  code: string;
  event: AcademyEvent;
  ticketUrl: string;
  logoUrl: string;
  qrCid: string;
}

export const ticketEmail = (m: TicketEmail) => {
  const c = copy[m.lang];
  const title = m.event.title[m.lang];
  const day = formatDate(m.event.date, m.lang, { weekday: 'long' });
  const time = formatDate(m.event.date, m.lang, { day: undefined, month: undefined, year: undefined, hour: '2-digit', minute: '2-digit' });
  const place = m.event.place?.[m.lang] ?? '';
  const name = escape(m.firstName);
  const shortCode = m.code.slice(0, 8).toUpperCase();

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #DCE5EE;font:500 13px/1.4 Arial,Helvetica,sans-serif;color:#4A5872;text-transform:uppercase;letter-spacing:.08em;width:90px;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #DCE5EE;font:600 16px/1.4 Arial,Helvetica,sans-serif;color:#0F2A5C;">${escape(value)}</td>
    </tr>`;

  const html = `<!doctype html>
<html lang="${m.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${escape(c.subject(title))}</title>
</head>
<body style="margin:0;padding:0;background:#F3F7FA;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(c.preheader(title))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F7FA;">
  <tr><td align="center" style="padding:32px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #DCE5EE;">
      <tr><td style="height:6px;background:#0F2A5C;background-image:linear-gradient(90deg,#0F2A5C,#3A9BD5,#2BA59B);font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:28px 32px 8px;">
        <img src="${m.logoUrl}" width="200" alt="IHEC Carthage English Academy" style="display:block;width:200px;max-width:100%;height:auto;border:0;">
      </td></tr>
      <tr><td style="padding:16px 32px 0;">
        <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:#E3F4F2;color:#1A7A72;font:700 12px/1 Arial,Helvetica,sans-serif;letter-spacing:.06em;text-transform:uppercase;">✓ ${c.badge}</span>
        <h1 style="margin:18px 0 8px;font:700 26px/1.25 Georgia,'Times New Roman',serif;color:#0F2A5C;">${c.hello(name)}</h1>
        <p style="margin:0;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#13213D;">${c.intro}</p>
      </td></tr>
      <tr><td style="padding:20px 32px 4px;">
        <p style="margin:0 0 12px;font:700 21px/1.3 Georgia,'Times New Roman',serif;color:#0F2A5C;">${escape(title)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #0F2A5C;">
          ${row(c.date, day)}
          ${m.event.showTime === false ? '' : row(c.time, time)}
          ${place ? row(c.place, place) : ''}
        </table>
      </td></tr>
      <tr><td align="center" style="padding:24px 32px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="background:#F3F7FA;border-radius:16px;">
          <tr><td align="center" style="padding:20px 20px 12px;">
            <img src="cid:${m.qrCid}" width="220" height="220" alt="QR code" style="display:block;width:220px;height:220px;border:0;border-radius:8px;">
          </td></tr>
          <tr><td align="center" style="padding:0 20px 18px;font:600 13px/1.4 'Courier New',monospace;color:#4A5872;letter-spacing:.12em;">${c.ticketNo} ${shortCode}</td></tr>
        </table>
        <p style="margin:14px 0 0;font:400 14px/1.5 Arial,Helvetica,sans-serif;color:#4A5872;">${c.qrHelp}</p>
      </td></tr>
      <tr><td align="center" style="padding:20px 32px 28px;">
        <a href="${m.ticketUrl}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#0F2A5C;color:#FFFFFF;text-decoration:none;font:700 15px/1 Arial,Helvetica,sans-serif;">${c.download}</a>
      </td></tr>
      <tr><td style="padding:18px 32px;border-top:1px solid #DCE5EE;background:#FAFCFD;">
        <p style="margin:0;font:400 13px/1.55 Arial,Helvetica,sans-serif;color:#4A5872;">${c.cancel}</p>
      </td></tr>
    </table>
    <p style="margin:20px 0 0;font:400 12px/1.6 Arial,Helvetica,sans-serif;color:#4A5872;text-align:center;">
      <strong style="color:#0F2A5C;">IHEC English Academy</strong> · Communicate • Lead • Succeed<br>IHEC Carthage, Tunisia
    </p>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    c.hello(m.firstName),
    '',
    c.intro,
    title,
    '',
    `${c.date}: ${day}`,
    m.event.showTime === false ? '' : `${c.time}: ${time}`,
    place ? `${c.place}: ${place}` : '',
    '',
    `${c.ticketNo} ${shortCode}`,
    c.qrHelp,
    `${c.download}: ${m.ticketUrl}`,
    '',
    c.cancel,
    '',
    'IHEC English Academy — IHEC Carthage',
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n');

  return { subject: c.subject(title), html, text };
};
