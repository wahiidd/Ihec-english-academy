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

## Deployment

The site deploys as-is on **Netlify** or **Vercel** from the GitHub repository:

- Build command: `npm run build`
- Output directory: `dist`

The public URL used for canonical/Open Graph links is detected automatically on both platforms.
Once a custom domain is set, add a `SITE_URL` environment variable (e.g. `https://english.ihec.tn`).
