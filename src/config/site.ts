/**
 * Site settings — the only file to edit for links and practical details.
 * Leave a value empty ('') while it is not known yet: the site then shows a "coming soon" state.
 */
export const site = {
  name: 'IHEC English Academy',

  /** Launch date (Tunisia time, UTC+1). Drives the hero countdown. */
  launchDate: '2026-10-05T00:00:00+01:00',

  /** Annual membership fee, in Tunisian dinars. */
  membershipFee: 30,

  /** Registration link (e.g. a Google Form). Empty = "Registration opens soon". */
  joinUrl: '',

  /** Contact email. Empty = "coming soon". */
  email: '',

  /** Social media profiles. Empty = icon shown as "coming soon". */
  socials: {
    instagram: '',
    facebook: '',
    linkedin: '',
    tiktok: '',
    youtube: '',
  },
};

export type SocialNetwork = keyof typeof site.socials;
