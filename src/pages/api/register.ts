import type { APIRoute } from 'astro';
import { STUDY_LEVELS, findEvent, registrationOpen } from '../../data/events';
import { findByCode, registerAttendee } from '../../lib/server/db';
import { sendTicket } from '../../lib/server/mail';
import { newTicketCode, ticketUrl } from '../../lib/server/tickets';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');

export const POST: APIRoute = async ({ request, site }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ status: 'invalid' }, 400);
  }

  // Honeypot: real visitors never fill this hidden field.
  if (clean(body.website, 100)) return json({ status: 'invalid' }, 400);

  const event = findEvent(clean(body.event, 80));
  if (!event?.registration) return json({ status: 'invalid' }, 400);
  if (!registrationOpen(event)) return json({ status: 'closed' }, 409);

  const lang = body.lang === 'en' ? 'en' : 'fr';
  const firstName = clean(body.firstName, 60);
  const lastName = clean(body.lastName, 60);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 30);
  const levelChoice = clean(body.level, 10);
  const levelOther = clean(body.levelOther, 60);

  const fields: Record<string, true> = {};
  if (!firstName) fields.firstName = true;
  if (!lastName) fields.lastName = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fields.email = true;
  if (!/^\+?[\d\s().-]{8,20}$/.test(phone)) fields.phone = true;
  const isLevel = (STUDY_LEVELS as readonly string[]).includes(levelChoice);
  if (!isLevel && !(levelChoice === 'other' && levelOther.length >= 2)) fields.level = true;
  if (Object.keys(fields).length) return json({ status: 'invalid', fields }, 400);

  const level = isLevel ? levelChoice : `Autre : ${levelOther}`;
  const siteUrl = site ?? new URL(request.url);

  let result;
  try {
    result = await registerAttendee({
      event: event.slug,
      capacity: event.registration.capacity,
      code: newTicketCode(),
      firstName,
      lastName,
      email,
      phone,
      level,
      lang,
    });
  } catch (err) {
    console.error('register: database error', err);
    return json({ status: 'error' }, 503);
  }

  if (result.out_status === 'full') return json({ status: 'full', remaining: 0 }, 409);

  const code = result.out_code!;
  // A second sign-up with the same e-mail re-sends the original ticket.
  const owner = result.out_status === 'duplicate' ? await findByCode(code) : undefined;

  let emailSent = true;
  try {
    await sendTicket({
      site: siteUrl,
      to: owner?.email ?? email,
      lang: owner?.lang ?? lang,
      firstName: owner?.first_name ?? firstName,
      lastName: owner?.last_name ?? lastName,
      code,
      event,
    });
  } catch (err) {
    emailSent = false;
    console.error('register: e-mail not sent', err);
  }

  return json({
    status: result.out_status,
    remaining: result.out_remaining,
    ticketUrl: ticketUrl(siteUrl, code),
    emailSent,
  });
};
