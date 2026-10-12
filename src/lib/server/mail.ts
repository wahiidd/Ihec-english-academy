import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } from 'astro:env/server';
import type { AcademyEvent } from '../../data/events';
import type { Lang } from '../../i18n/utils';
import { ticketEmail } from './email-template';
import { checkInUrl, qrPng, ticketUrl } from './tickets';

let transport: nodemailer.Transporter | undefined;

const mailer = () => {
  if (!SMTP_USER || !SMTP_PASS) throw new Error('SMTP_USER / SMTP_PASS are not set');
  transport ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transport;
};

export const sendTicket = async (p: {
  site: URL;
  to: string;
  lang: Lang;
  firstName: string;
  lastName: string;
  code: string;
  event: AcademyEvent;
}) => {
  const qrCid = `qr-${p.code}@ihec-english-academy`;
  const png = await qrPng(checkInUrl(p.site, p.code));
  const { subject, html, text } = ticketEmail({
    lang: p.lang,
    firstName: p.firstName,
    lastName: p.lastName,
    code: p.code,
    event: p.event,
    ticketUrl: ticketUrl(p.site, p.code),
    logoUrl: new URL('/images/logo-full.png', p.site).href,
    qrCid,
  });
  const fileName = p.lang === 'fr' ? 'billet-qr-code.png' : 'ticket-qr-code.png';

  await mailer().sendMail({
    from: MAIL_FROM || `IHEC English Academy <${SMTP_USER}>`,
    to: `${p.firstName} ${p.lastName} <${p.to}>`,
    subject,
    html,
    text,
    attachments: [
      { filename: 'qr.png', content: png, cid: qrCid, contentType: 'image/png', contentDisposition: 'inline' },
      { filename: fileName, content: png, contentType: 'image/png' },
    ],
  });
};
