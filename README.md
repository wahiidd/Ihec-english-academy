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

## Design system

This branch was redesigned with the [Hallmark](https://github.com/nutlope/hallmark) skill
(editorial genre, *Narrative Workflow* structure: the page walks through four stages —
I Join · II Practise · III Train · IV Certify).

- All colours, fonts, spacing and motion values are tokens in `tokens.css` — change them there, never inline.
- Fonts: Fraunces (headings) + IBM Plex Sans (text), self-hosted via `@fontsource`.
- `.hallmark/` records the design choices so future Hallmark runs stay consistent.

## Deployment

The site deploys as-is on **Netlify** or **Vercel** from the GitHub repository:

- Build command: `npm run build`
- Output directory: `dist`

The public URL used for canonical/Open Graph links is detected automatically on both platforms.
Once a custom domain is set, add a `SITE_URL` environment variable (e.g. `https://english.ihec.tn`).
