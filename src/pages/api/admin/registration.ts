import type { APIRoute } from 'astro';
import { STUDY_LEVELS, findEvent } from '../../../data/events';
import { isAdmin } from '../../../lib/server/auth';
import { deleteRegistration, updateRegistration } from '../../../lib/server/db';
import { sendTicket } from '../../../lib/server/mail';
import { isTicketCode } from '../../../lib/server/tickets';

export const prerender = false;

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');

/** Edit a registration's details (optionally re-sending the ticket). */
export const PATCH: APIRoute = async ({ request, cookies, site }) => {
  if (!isAdmin(cookies)) return Response.json({ status: 'unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const code = clean(body.code, 30);
  if (!isTicketCode(code)) return Response.json({ status: 'invalid' }, { status: 400 });

  const firstName = clean(body.firstName, 60);
  const lastName = clean(body.lastName, 60);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 30);
  const levelChoice = clean(body.level, 10);
  const levelOther = clean(body.levelOther, 60);
  const isLevel = (STUDY_LEVELS as readonly string[]).includes(levelChoice);

  const fields: Record<string, true> = {};
  if (!firstName) fields.firstName = true;
  if (!lastName) fields.lastName = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fields.email = true;
  if (!/^\+?[\d\s().-]{8,20}$/.test(phone)) fields.phone = true;
  if (!isLevel && !(levelChoice === 'other' && levelOther.length >= 2)) fields.level = true;
  if (Object.keys(fields).length) return Response.json({ status: 'invalid', fields }, { status: 400 });

  try {
    const row = await updateRegistration(code, {
      firstName,
      lastName,
      email,
      phone,
      level: isLevel ? levelChoice : `Autre : ${levelOther}`,
    });
    if (!row) return Response.json({ status: 'not_found' }, { status: 404 });

    let emailSent: boolean | undefined;
    const event = findEvent(row.event_slug);
    if (body.resend && event) {
      try {
        await sendTicket({
          site: site ?? new URL(request.url),
          origin: new URL(request.url).origin,
          to: row.email,
          lang: row.lang,
          firstName: row.first_name,
          lastName: row.last_name,
          code: row.ticket_code,
          event,
        });
        emailSent = true;
      } catch (err) {
        console.error('admin edit: e-mail not sent', err);
        emailSent = false;
      }
    }
    return Response.json({ status: 'ok', emailSent });
  } catch (err) {
    // Unique (event, e-mail): another registration already uses this address.
    if ((err as { code?: string }).code === '23505') {
      return Response.json({ status: 'invalid', fields: { email: true }, duplicate: true }, { status: 409 });
    }
    console.error('admin edit: database error', err);
    return Response.json({ status: 'error' }, { status: 500 });
  }
};

/** Delete a registration — its seat becomes available again. */
export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!isAdmin(cookies)) return Response.json({ status: 'unauthorized' }, { status: 401 });
  const { code } = (await request.json().catch(() => ({}))) as { code?: string };
  if (!isTicketCode(code)) return Response.json({ status: 'invalid' }, { status: 400 });
  const row = await deleteRegistration(code);
  return Response.json({ status: row ? 'ok' : 'not_found' }, { status: row ? 200 : 404 });
};
