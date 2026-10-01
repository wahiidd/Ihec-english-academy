// @ts-check
import { defineConfig } from 'astro/config';

// Public URL of the site (canonical links, Open Graph, hreflang).
// Netlify exposes URL, Vercel exposes VERCEL_PROJECT_PRODUCTION_URL; SITE_URL overrides both
// once a custom domain is set.
const site =
  process.env.SITE_URL ||
  process.env.URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:4321';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: { prefixDefaultLocale: false },
  },
});
