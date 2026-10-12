import type { APIRoute } from 'astro';
import { findEvent, levelLabel } from '../../../data/events';
import { isAdmin } from '../../../lib/server/auth';
import { checkIn, undoCheckIn } from '../../../lib/server/db';
import { isTicketCode } from '../../../lib/server/tickets';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAdmin(cookies)) return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401 });
  const { code, undo } = (await request.json().catch(() => ({}))) as { code?: string; undo?: boolean };
  if (!isTicketCode(code)) return Response.json({ status: 'invalid' });
  if (undo) {
    const row = await undoCheckIn(code);
    return Response.json({ status: row ? 'undone' : 'invalid' });
  }
  const result = await checkIn(code);
  if (result.status === 'invalid') return Response.json({ status: 'invalid' });
  const r = result.registration;
  return Response.json({
    status: result.status,
    name: `${r.first_name} ${r.last_name}`,
    level: levelLabel(r.study_level),
    event: findEvent(r.event_slug)?.title.fr ?? r.event_slug,
    checkedInAt: r.checked_in_at,
  });
};
