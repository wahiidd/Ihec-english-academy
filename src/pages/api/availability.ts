import type { APIRoute } from 'astro';
import { closesAt, events, registrationOpen } from '../../data/events';
import { countsByEvent } from '../../lib/server/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const counts = await countsByEvent();
    const data = events
      .filter((e) => e.registration)
      .map((e) => {
        const capacity = e.registration!.capacity;
        const remaining = Math.max(capacity - (counts.get(e.slug)?.taken ?? 0), 0);
        return { slug: e.slug, capacity, remaining, open: registrationOpen(e) && remaining > 0, closesAt: closesAt(e) };
      });
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('availability: database error', err);
    return new Response(JSON.stringify({ status: 'error' }), { status: 503 });
  }
};
