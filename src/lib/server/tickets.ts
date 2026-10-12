import { randomBytes } from 'node:crypto';
import QRCode from 'qrcode';

/** 128-bit random code: unguessable, URL-safe, short enough for a compact QR code. */
export const newTicketCode = () => randomBytes(16).toString('base64url');

export const isTicketCode = (code: string | undefined): code is string => !!code && /^[A-Za-z0-9_-]{22}$/.test(code);

/** The QR code encodes this URL: an admin's phone camera checks the attendee in, anyone else sees the ticket. */
export const checkInUrl = (site: URL, code: string) => new URL(`/c/${code}`, site).href;
export const ticketUrl = (site: URL, code: string) => new URL(`/ticket/${code}`, site).href;

export const qrPng = (content: string, width = 600) =>
  QRCode.toBuffer(content, {
    type: 'png',
    width,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#0F2A5CFF', light: '#FFFFFFFF' },
  });
