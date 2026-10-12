// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// Public URL of the site (canonical links, Open Graph, hreflang, ticket links in e-mails).
// Vercel previews use their branch URL (so ticket links and QR codes work before merging),
// production uses VERCEL_PROJECT_PRODUCTION_URL; SITE_URL overrides both once a custom domain is set.
const vercelUrl =
  process.env.VERCEL_ENV === 'preview' ? process.env.VERCEL_BRANCH_URL : process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site =
  process.env.SITE_URL ||
  process.env.URL ||
  (vercelUrl && `https://${vercelUrl}`) ||
  'http://localhost:4321';

const secret = (optional = true) => envField.string({ context: 'server', access: 'secret', optional });

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  // Pages stay static; registration, tickets and admin routes opt into on-demand rendering.
  adapter: vercel(),
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: { prefixDefaultLocale: false },
  },
  env: {
    schema: {
      DATABASE_URL: secret(),
      SMTP_HOST: envField.string({ context: 'server', access: 'secret', default: 'smtp.gmail.com' }),
      SMTP_PORT: envField.number({ context: 'server', access: 'secret', default: 465 }),
      SMTP_USER: secret(),
      SMTP_PASS: secret(),
      MAIL_FROM: secret(),
      ADMIN_PASSWORD: secret(),
      ADMIN_SECRET: secret(),
    },
  },
});
