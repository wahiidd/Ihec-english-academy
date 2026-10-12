# IHEC English Academy — Website

Bilingual (EN/FR) showcase website of **IHEC English Academy**, the English academy of IHEC Carthage.
Built with [Astro](https://astro.build) as a fully static site.

- English: `/`
- French: `/fr/`

## Run locally

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Updating content

| What | Where |
| --- | --- |
| Social media links, contact email, registration link, launch date, membership fee | `src/config/site.ts` |
| All texts (English / French) | `src/i18n/en.ts` / `src/i18n/fr.ts` |
| Upcoming events | `src/data/events.ts` |
| Logo, favicon, social preview image | `public/` |

Empty values in `site.ts` show a "coming soon" state on the site (e.g. greyed-out social icons,
"Registration opens soon" button). Fill them in and redeploy.

## Event registrations

Events live in `src/data/events.ts`. An event with a `registration: { capacity }` gets, on the home page,
a live countdown, the number of seats left and a **Register** button. Registrations close at the end of the
day before the event (or `closesAt`), or as soon as the capacity is reached — enforced in the database, so the
limit can never be exceeded.

Each registrant receives an HTML e-mail with a QR code (inline + attached) and a link to a ticket page where the
QR code can be downloaded. The QR code opens `/c/<code>`: on a phone where an admin is logged in, it validates
attendance; for anyone else it shows the ticket.

| Page | Use |
| --- | --- |
| `/admin` | Password-protected sheet per event (one tab each): live list refreshed every few seconds, stats, search, filters (validated / pending), sorting, manual validation, edit or delete a registration (frees the seat, can re-send the ticket), Excel export (one event, or all events with one sheet each) |
| `/admin/scan` | Camera scanner for the entrance (green = validated, orange = already scanned, red = invalid) |

### Setup (once)

1. **Database — Supabase** (free): create a project, open *SQL Editor*, paste `supabase/schema.sql`, run it.
   Then *Connect* → copy the **Transaction pooler** connection string (port 6543) → `DATABASE_URL`.
2. **E-mail — Gmail SMTP** with `ihec.english.academy@gmail.com`:
   1. Google Account → *Security* → turn on **2-Step Verification** (required for app passwords).
   2. Open <https://myaccount.google.com/apppasswords>, create an app password named “Website”.
   3. Copy the 16-character password (without spaces) → `SMTP_PASS`. `SMTP_USER` is the Gmail address.
   4. Check it with `npm run test:smtp` (sends a test e-mail to the academy's own address).
3. **Admin**: choose `ADMIN_PASSWORD`; generate `ADMIN_SECRET` with `openssl rand -hex 32`.
4. **Vercel** → *Project* → *Settings* → *Environment Variables*: add every variable from `.env.example`, then redeploy.
5. Locally: copy `.env.example` to `.env`, fill it in, run `npm run dev`.

## Deployment

The site deploys as-is on **Netlify** or **Vercel** from the GitHub repository:

- Build command: `npm run build`
- Output directory: `dist`

The public URL used for canonical/Open Graph links is detected automatically on both platforms.
Once a custom domain is set, add a `SITE_URL` environment variable (e.g. `https://english.ihec.tn`).
