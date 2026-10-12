import type { APIRoute } from 'astro';
import { findEvent } from '../../../data/events';
import { findByCode } from '../../../lib/server/db';
import { buildTicketPdf, ticketFileName } from '../../../lib/server/ticket-file';
import { isTicketCode } from '../../../lib/server/tickets';

export const prerender = false;

export const GET: APIRoute = async ({ params, site, request }) => {
  const code = params.code;
  const reg = isTicketCode(code) ? await findByCode(code) : undefined;
  const event = reg && findEvent(reg.event_slug);
  if (!reg || !event) return new Response('Not found', { status: 404 });

  const pdf = await buildTicketPdf({
    site: site ?? new URL(request.url),
    origin: new URL(request.url).origin,
    lang: reg.lang,
    firstName: reg.first_name,
    lastName: reg.last_name,
    code: reg.ticket_code,
    event,
  });
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${ticketFileName(event, reg.lang)}"`,
      'Cache-Control': 'private, no-store',
    },
  });
};
