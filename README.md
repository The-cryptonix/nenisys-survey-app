# nenisys-survey-app

Public survey front end for Nenisys. React + Vite + TypeScript, deployed on Vercel. It renders whatever survey the backend (`nenisys-backend-survey`) publishes, so one app serves any future survey, not one niche.

## What it does

- Loads the active survey from `GET /survey/active` and builds the form from the questions it receives (`single_choice`, `multiple_choice`, `checklist`, "Other" and "None of the above" options, conditional questions via `visibleIf`, min and max selections).
- One question per screen, with a progress bar, plain-language hints, inline errors and focus management.
- A consent step before the first question, then Terms of Use, Privacy Notice and "How we use your answers" pages in plain language (`#/terms`, `#/privacy`, `#/usage`).
- Draft saving in this browser only (localStorage, 7 days), restored on return and removed on submit.
- Human check: a Cloudflare Turnstile widget on the last question (mostly invisible). Submit stays disabled until it passes, and the token is sent as `X-Turnstile-Token`. A failed send asks for a fresh token, because tokens are single use.
- Safe submission: one `Idempotency-Key` per set of answers, reused on every retry, with automatic retries for network, timeout and 5xx failures.
- Backend error codes are never shown. Every error is mapped to a readable message (`src/errors.ts`) and shown as a toast, plus an inline message where it helps.

## App states

| State | When |
|---|---|
| Loading | Fetching the survey (skeleton) |
| Open: intro, then questions | Survey is open |
| Closed | Deadline passed or submissions paused (the backend reports both as `closed`) |
| Not open yet | `opens_at` is in the future |
| No survey | Nothing published |
| Failed to load | Network, timeout, server or unreadable reply, with a Try again button |
| Already responded | This browser already submitted this survey version |
| Thank you | Response received (a repeated send is also treated as received) |

## Run it

```
npm install
cp .env.example .env     # set VITE_API_BASE_URL
npm run dev
npm test                 # answer rules, colour contrast, submit headers
npm run build            # typecheck + production build
```

## Configuration

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL, no trailing slash. Set it in the Vercel project settings. |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (public). Leave empty to switch the human check off. The secret key lives only in the backend (`TURNSTILE_SECRET_KEY`). |

## Deploying

1. Import the repo in Vercel (framework preset: Vite). Set `VITE_API_BASE_URL`.
2. **Backend CORS:** add the exact origin of this app to the backend's `ALLOWED_ORIGINS` (comma separated, exact match, e.g. `https://survey.nenisys.shop` and any `*.vercel.app` preview URL you test on). Until then the browser blocks every request and the app shows "We could not load the survey".
3. **Domain:** point `survey.nenisys.shop` at the Vercel project when ready. Until then it runs on its `*.vercel.app` URL.
4. **Human check:** create a Turnstile widget in Cloudflare (Managed mode) and allow this app's hostnames (the `*.vercel.app` URL you test on and `survey.nenisys.shop`). Set `VITE_TURNSTILE_SITE_KEY` here and `TURNSTILE_SECRET_KEY` in the backend, then redeploy both. For testing, Cloudflare's dummy keys always pass: site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.
5. **CSP:** `vercel.json` sets a strict Content-Security-Policy. It allows scripts and frames from `https://challenges.cloudflare.com` for Turnstile. `connect-src` currently allows `https://*.nenisys.shop` and `https://*.vercel.app`. Once the API's final domain is fixed, replace those with that single origin.

## Structure

```
src/
  config.ts            env + constants
  types.ts             backend shapes
  errors.ts            typed errors and their friendly messages
  services/            http.ts (timeout, safe parsing) and surveyService.ts (parse, retry, map outcomes)
  lib/                 answers.ts (rules), draft.ts (local progress), format.ts, useRoute.ts
  hooks/useSurvey.ts   controller: phases, answers, submit, retry, human check, outdated-survey reload
  components/          Layout, StatePanel, QuestionStep, HumanCheck, TurnstileWidget, Toasts, Icons
  pages/               SurveyView, Intro, LegalPage
  legal/content.ts     plain-language legal text
  styles.css           brand tokens and components
```

To support a new question type, add it to the parser in `services/surveyService.ts` (unknown types make the survey fail safely instead of rendering wrongly), then to `QuestionStep.tsx`.

## Privacy by design

No cookies or analytics. The only third-party request is Cloudflare Turnstile, loaded on the last question only (script and frame from `challenges.cloudflare.com`). Fonts are bundled (`@fontsource/poppins`), and `connect-src` only allows the API. The page never sends a name, email or device details. The legal text names Cloudflare; keep it in step if the check changes.

## Before launch

- The legal text in `src/legal/content.ts` is a plain-language draft. Have it reviewed (including under the Nigeria Data Protection Act), including the new Cloudflare wording. The 90-day retention in `config.ts` is the proposal from the backend's `docs/PRIVACY.md`; confirm it.
- The backend does not expose the `Retry-After` header to browsers, so rate-limit messages say "a few minutes". Add `exposeHeaders: ['Retry-After']` to the backend CORS config if you want exact times.
