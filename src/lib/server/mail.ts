import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } from 'astro:env/server';
import type { AcademyEvent } from '../../data/events';
import type { Lang } from '../../i18n/utils';
import { ticketEmail } from './email-template';
import { buildTicketPdf, ticketFileName } from './ticket-file';
import { ticketUrl } from './tickets';

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
  origin: string;
  to: string;
  lang: Lang;
  firstName: string;
  lastName: string;
  code: string;
  event: AcademyEvent;
}) => {
  const { subject, html, text } = ticketEmail({
    lang: p.lang,
    firstName: p.firstName,
    lastName: p.lastName,
    code: p.code,
    event: p.event,
    ticketUrl: ticketUrl(p.site, p.code),
    pdfUrl: new URL(`/api/ticket/${p.code}`, p.site).href,
    logoUrl: new URL('/images/logo-full.png', p.site).href,
    // Hosted image rather than an inline (cid) attachment: shown by every client, incl. Gmail apps.
    qrUrl: new URL(`/api/qr/${p.code}`, p.site).href,
  });
  const pdf = await buildTicketPdf(p);

  await mailer().sendMail({
    from: MAIL_FROM || `IHEC English Academy <${SMTP_USER}>`,
    to: `${p.firstName} ${p.lastName} <${p.to}>`,
    subject,
    html,
    text,
    // Each ticket is its own conversation: stops Gmail from threading them and hiding repeated content.
    headers: { 'X-Entity-Ref-ID': p.code },
    attachments: [
      { filename: ticketFileName(p.event, p.lang), content: Buffer.from(pdf), contentType: 'application/pdf' },
    ],
  });
};
