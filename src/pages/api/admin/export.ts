import type { APIRoute } from 'astro';
import { levelLabel } from '../../../data/events';
import { isAdmin } from '../../../lib/server/auth';
import { listRegistrations } from '../../../lib/server/db';

export const prerender = false;

const tunis = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Tunis' });

const cell = (v: unknown) => {
  const s = v instanceof Date ? tunis.format(v) : String(v ?? '');
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isAdmin(cookies)) return new Response('Unauthorized', { status: 401 });
  const event = url.searchParams.get('event') ?? '';
  const rows = await listRegistrations(event);
  const header = ['Prénom', 'Nom', 'E-mail', 'Téléphone', 'Niveau', 'Inscrit le', 'Présent', 'Scanné le'];
  const lines = rows.map((r) =>
    [r.first_name, r.last_name, r.email, r.phone, levelLabel(r.study_level), r.created_at, r.checked_in_at ? 'oui' : 'non', r.checked_in_at ?? '']
      .map(cell)
      .join(';'),
  );
  // BOM + semicolons so Excel (FR locale) opens accents and columns correctly.
  const csv = '﻿' + [header.join(';'), ...lines].join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inscriptions-${event}.csv"`,
    },
  });
};
