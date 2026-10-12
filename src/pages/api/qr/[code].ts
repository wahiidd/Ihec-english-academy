import type { APIRoute } from 'astro';
import { checkInUrl, isTicketCode, qrPng } from '../../../lib/server/tickets';

export const prerender = false;

export const GET: APIRoute = async ({ params, url, site, request }) => {
  const code = params.code;
  if (!isTicketCode(code)) return new Response('Not found', { status: 404 });
  const png = await qrPng(checkInUrl(site ?? new URL(request.url), code), 800);
  const headers: Record<string, string> = {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=31536000, immutable',
  };
  if (url.searchParams.has('download')) {
    headers['Content-Disposition'] = `attachment; filename="ihec-english-academy-ticket.png"`;
  }
  return new Response(new Uint8Array(png), { headers });
};
