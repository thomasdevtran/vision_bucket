# Portfolio walkthrough

[Open the public portfolio demo](https://thomasdevtran.github.io/vision_bucket/) — no sign-in required.

Run `npm run demo` for development, or `npm run build:demo` followed by
`npm run preview:demo` to inspect the exact static build at http://127.0.0.1:4173.
Use Node.js 22+ and `npm ci` on a fresh checkout. No `.env`, Firebase project,
TMDB key, backend process, or sign-in is required in demo mode.

## Two-minute walkthrough

1. Browse the Action and Comedy shelves. Search for **Orbit**.
2. Open a film, select a status, add a rating and note, and save it.
3. Write a review. Edit it and refresh to demonstrate persistence.
4. Open Profile to see watch history, status counts, and reviews.
5. Open Discussion → General Discussion, create a thread and add a comment.
6. Use **Reset demo** to restore the seeded session.

## What visitors are seeing

This is a static React demo of the interface and its workflows. The films,
artwork, community members, reviews, and discussions are fictional sample data.
Visitor changes are stored in `vision-bucket-demo-v1` in their browser's
localStorage. Different visitors do not share data. Reset removes only that key.
Browsers that block storage show an error when saving; clearing site data also
restores the samples. Google Fonts may load when online; system fonts are the fallback.

The Express/Firebase backend remains a separate, authenticated application.
Demo mode does not bypass or weaken its authentication. It never sends demo
tokens to the API. Normal `npm start` / `npm run build` retain the live integration.
News publishing and backend-only features (follows, diary, lists, recommendations,
moderation, notifications, import/export) are outside this demo's interface.

## GitHub Pages

The public demo is hosted on GitHub Pages. The workflow in
`.github/workflows/demo-pages.yml` tests, builds, and publishes each push to
`codex/portfolio-demo`. Pages is configured to use GitHub Actions, with the
`github-pages` environment allowing this demo branch. The workflow uses Pages
metadata to set `PUBLIC_URL` so scripts, styles, and poster art load under
`/vision_bucket/`. No Firebase or TMDB secrets are needed.

To reproduce the Pages build locally in PowerShell:

```powershell
$env:PUBLIC_URL="/vision_bucket"
npm run build:demo
Remove-Item Env:PUBLIC_URL
```

For the root-path local preview, run `npm run build:demo` again without
`PUBLIC_URL`, then `npm run preview:demo`.

## Other static hosting

Publish **only the contents of `build/`** after `npm run build:demo`. Hash routes
support direct links and refreshes on static hosts without rewrite rules.
The demo build script clears the live Firebase configuration and API address,
and disables source maps. Never upload `.env`, `node_modules`, or service-account
files. A shareable demo still needs static hosting; no backend deployment is needed.

## Suggested portfolio description

**Vision Bucket — movie tracking and community app.** React/TypeScript frontend
paired with an Express/Firebase API. Explore a no-sign-in demo featuring movie
discovery, personal watch tracking, reviews, and discussion workflows. The demo
uses fictional content and browser-local persistence; the backend repository
contains token verification, ownership controls, and emulator integration tests.

Mention the original university team project and distinguish your individual
contributions when describing the project in your portfolio.

## Checks

- `npm test -- --watchAll=false`: review form and demo data lifecycle tests.
- `npm run build:demo`: static demo production build.
- Backend: `npm run lint`, `npm run test:unit`, `npm run build`.
- Backend emulator suite (Java 21+, Firebase CLI installed by npm):
  set `FIREBASE_PROJECT_ID=demo-vision-bucket`, then `npm run test:emulator`.
