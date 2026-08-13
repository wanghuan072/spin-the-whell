# Spin the Wheel

A playful, SEO-focused wheel spinner built with Next.js 16 and local JSON content.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
```

See [`../PRODUCTION_CHECKLIST.md`](../PRODUCTION_CHECKLIST.md) before deploying the frontend and API.

The comments API is a separate service in `../spin-the-whell-api`. Its
production workflow compiles TypeScript into `dist` before starting Node:

```bash
cd ../spin-the-whell-api
npm run build
npm run start
```

## Google sign-in

Comments require Google sign-in; the wheel itself remains available without an
account. Put the Google web application client ID in the frontend environment:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

Use the same value for `GOOGLE_CLIENT_ID` in the API. For local development,
add `http://localhost:3000` as an Authorized JavaScript origin in Google Cloud.
No redirect URI is required for the popup-based flow. See the API README for
the database migration and complete backend setup.

## Project structure

- `src/app` — routes, metadata routes, and the root layout
- `src/page` — standalone page implementations
- `src/components` — reusable layout and feature components
- `src/features/wheel` — the complete wheel feature: components, styles, config, types, and pure logic
- `src/config` — site-wide and wheel configuration
- `src/data` — clean JSON content collections
- `src/lib` — framework-independent parsing and wheel helpers
- `src/style` — global foundations and route/component CSS Modules
- `src/types` — shared TypeScript contracts
- `src/seo` — metadata and structured-data helpers
- `public/images` — local template and article illustrations

The interactive wheel is self-contained in `src/features/wheel`. `WheelGame`
coordinates the experience, import dialogs own spreadsheet state, `config.ts`
stores editable presets, and `lib/` contains testable pure logic.

The production site origin is `https://spinanywheel.com`. Set
`NEXT_PUBLIC_SITE_URL` explicitly in the deployment environment so canonical,
sitemap, JSON-LD, and social image URLs remain correct in every environment.
