const rawBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
const rawSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';

export const config = {
  /** Backend base URL without a trailing slash. Empty means the app is not configured. */
  apiBaseUrl: rawBase.replace(/\/+$/, ''),
  /** Cloudflare Turnstile site key (public). Empty means the human check is off, e.g. in a bare preview. */
  turnstileSiteKey: rawSiteKey,
  requestTimeoutMs: 12_000,
  organisation: 'Nenisys',
  contactEmail: 'hello@nenisys.shop',
  /** Proposed retention from the backend privacy notes (docs/PRIVACY.md). Confirm before launch. */
  retentionDays: 90,
  /** Shown on the legal pages. Update whenever the legal text changes. */
  legalUpdated: '15 October 2026',
} as const;
