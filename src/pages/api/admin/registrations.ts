import type { APIRoute } from 'astro';
import { findEvent } from '../../../data/events';
import { isAdmin } from '../../../lib/server/auth';
import { sheet } from '../../../lib/server/admin-data';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isAdmin(cookies)) return Response.json({ status: 'unauthorized' }, { status: 401 });
  const event = findEvent(url.searchParams.get('event') ?? '');
  if (!event?.registration) return Response.json({ status: 'not_found' }, { status: 404 });
  return Response.json(await sheet(event), { headers: { 'Cache-Control': 'no-store' } });
};
