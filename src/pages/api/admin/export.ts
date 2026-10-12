import type { APIRoute } from 'astro';
import ExcelJS from 'exceljs';
import { findEvent } from '../../../data/events';
import { isAdmin } from '../../../lib/server/auth';
import { adminEvents, sheet, type Sheet } from '../../../lib/server/admin-data';

export const prerender = false;

const NAVY = 'FF0F2A5C';
const TEAL_BG = 'FFE3F4F2';
const TEAL = 'FF1A7A72';
const GREY_BG = 'FFF3F7FA';
const GREY = 'FF4A5872';

/** Excel has no time zones: store Tunis wall-clock time (UTC+1). */
const tunis = (iso: string) => new Date(Date.parse(iso) + 60 * 60 * 1000);

/** Sheet names: max 31 characters, no []:*?/\ */
const sheetName = (title: string, used: Set<string>) => {
  let name = title.replace(/[[\]:*?/\\]/g, ' ').replace(/’/g, "'").slice(0, 31).trim();
  for (let i = 2; used.has(name); i++) name = `${name.slice(0, 27)} (${i})`;
  used.add(name);
  return name;
};

const addSheet = (wb: ExcelJS.Workbook, s: Sheet, used: Set<string>) => {
  const ws = wb.addWorksheet(sheetName(s.event.title, used), {
    views: [{ state: 'frozen', ySplit: 4 }],
    properties: { tabColor: { argb: NAVY } },
  });

  ws.columns = [
    { key: 'n', width: 6 },
    { key: 'firstName', width: 18 },
    { key: 'lastName', width: 20 },
    { key: 'email', width: 32 },
    { key: 'phone', width: 18 },
    { key: 'level', width: 26 },
    { key: 'createdAt', width: 18 },
    { key: 'status', width: 14 },
    { key: 'checkedInAt', width: 18 },
  ];

  ws.mergeCells('A1:I1');
  ws.getCell('A1').value = s.event.label;
  ws.getCell('A1').font = { bold: true, size: 15, color: { argb: NAVY } };
  ws.mergeCells('A2:I2');
  ws.getCell('A2').value =
    `Inscrits : ${s.stats.registered} / ${s.event.capacity}   ·   Validés : ${s.stats.present}   ·   En attente : ${s.stats.pending}   ·   ` +
    `Export du ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Tunis' }).format(new Date())}`;
  ws.getCell('A2').font = { size: 10, color: { argb: GREY } };

  const header = ws.getRow(4);
  header.values = ['N°', 'Prénom', 'Nom', 'E-mail', 'Téléphone', 'Niveau', 'Inscrit le', 'Statut', 'Validé le'];
  header.height = 22;
  header.eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    c.alignment = { vertical: 'middle' };
  });

  s.rows.forEach((r, i) => {
    const row = ws.addRow({
      n: i + 1,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      phone: r.phone,
      level: r.level,
      createdAt: tunis(r.createdAt),
      status: r.checkedInAt ? 'Validé' : 'En attente',
      checkedInAt: r.checkedInAt ? tunis(r.checkedInAt) : '',
    });
    row.getCell('createdAt').numFmt = 'dd/mm/yyyy hh:mm';
    row.getCell('checkedInAt').numFmt = 'dd/mm/yyyy hh:mm';
    const status = row.getCell('status');
    status.font = { bold: true, color: { argb: r.checkedInAt ? TEAL : GREY } };
    status.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: r.checkedInAt ? TEAL_BG : GREY_BG } };
    row.eachCell((c) => (c.border = { bottom: { style: 'thin', color: { argb: 'FFDCE5EE' } } }));
  });

  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4 + s.rows.length, column: 9 } };
};

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isAdmin(cookies)) return new Response('Unauthorized', { status: 401 });
  const param = url.searchParams.get('event') ?? '';
  const list = param === 'all' ? adminEvents() : [findEvent(param)].filter((e) => e?.registration);
  if (!list.length) return new Response('Not found', { status: 404 });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'IHEC English Academy';
  const used = new Set<string>();
  for (const event of list) addSheet(wb, await sheet(event!), used);

  const date = new Date().toISOString().slice(0, 10);
  const name = param === 'all' ? `inscriptions-tous-evenements-${date}.xlsx` : `inscriptions-${param}-${date}.xlsx`;
  const buffer = await wb.xlsx.writeBuffer();
  return new Response(new Uint8Array(buffer as ArrayBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  });
};
