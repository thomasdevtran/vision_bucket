# Vision Bucket

[![CI](https://github.com/thomasdevtran/vision_bucket/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/thomasdevtran/vision_bucket/actions/workflows/ci.yml)

A full-stack movie tracking and community platform. Discover films, track what
you're watching, rate and review titles, and discuss them on community boards.

This repository is the **frontend** — a React + TypeScript single-page app. It
talks to a separate [Express / Firestore backend](https://github.com/thomasdevtran/vision_bucket_backend)
over a REST API and uses Firebase Authentication for sign-in.

**[Try the portfolio demo](https://thomasdevtran.github.io/vision_bucket/#/)** — no
sign-in required. Movie discovery uses live TMDB data through a movie-only API;
watch tracking, reviews, and discussions use sample data and browser-local storage.
Visitor changes are not shared with other users or saved to the full backend.

## Demo and full application

| | Portfolio demo | Full application (`main`) |
| --- | --- | --- |
| Access | Public link above, no account | Firebase email/password sign-in |
| Movie catalog | TMDB through the hosted movie-only API | TMDB through the configured Express backend |
| User activity | Sample community; changes in this browser's localStorage | Authenticated API and Firestore persistence |
| Source | [`codex/portfolio-demo`](https://github.com/thomasdevtran/vision_bucket/tree/codex/portfolio-demo) | This branch and the [backend](https://github.com/thomasdevtran/vision_bucket_backend) |

The demo is a separate implementation branch, not the result of `npm start` on
`main`. Clearing site data or using **Reset demo** removes your demo changes.
Live movie browsing requires the hosted movie API to be available. The demo does
not demonstrate shared accounts or backend authorization; those are covered by
the full application's backend tests.

For a quick walkthrough, browse a film, save a watch status, write a review, then
refresh and open **Your library**. Explore the sample discussions and use
**Reset demo** to start again. For implementation details and local demo commands,
see the demo branch's [walkthrough](https://github.com/thomasdevtran/vision_bucket/blob/codex/portfolio-demo/DEMO.md).

---

## Screenshots

![Sign in to Vision Bucket](docs/screenshots/auth.png)

This screenshot shows the full application's sign-in screen. The public demo
opens directly into movie discovery.

## Features

- **Authentication** — email/password sign-up and sign-in via Firebase Auth.
- **Movie discovery** — browse curated genre shelves and search a movie catalog.
  Movie data is served by a backend proxy (see [Movie data](#movie-data)).
- **Watch tracking** — tag titles as Completed, Dropped, On-hold, Plan-to-watch,
  or Rewatched, with ratings, progress, and notes.
- **Reviews** — write 1–5 star reviews, read community reviews per film, and edit
  or delete your own.
- **Discussion boards** — create threads and comment on General and News boards.
- **Profiles** — per-user dashboard with watch history, stats, and review activity.
- **Responsive UI** — layouts adapt from mobile to desktop.

## Tech stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React 18, TypeScript, React Router v6, Create React App |
| Auth       | Firebase Authentication (email/password)               |
| API client | `axios` + `fetch`, with Firebase ID tokens on protected calls |
| Backend    | Node.js / Express 5 + Firestore ([separate repo](https://github.com/thomasdevtran/vision_bucket_backend)) |
| Testing    | Jest + React Testing Library                           |

## Architecture

```mermaid
flowchart LR
    U[User's browser] --> SPA[React SPA]
    SPA -->|ID token sign-in| FB[Firebase Auth]
    SPA -->|REST + Bearer token| API[Express API]
    API --> FS[(Firestore)]
    API -->|server-side movie proxy| TMDB[(TMDB movie catalog)]
```

The SPA authenticates against Firebase Auth, then attaches the resulting Firebase
ID token as a `Bearer` token on every mutating request. The Express API verifies
that token, enforces ownership/roles, and is the **only** path to Firestore — the
Firestore security rules deny all direct client access.

## Getting started

### Prerequisites

- Node.js 22 and npm 10 (the CI toolchain)
- A [Firebase project](https://console.firebase.google.com/) with Email/Password
  authentication enabled
- The [backend server](https://github.com/thomasdevtran/vision_bucket_backend)
  running locally (default `http://localhost:5000`)

### Install

```bash
git clone https://github.com/thomasdevtran/vision_bucket.git
cd vision_bucket
npm ci
```

### Configure

Copy the example environment file and fill in your own values:

```bash
cp .env.example .env
```

`.env` is gitignored. The Firebase web values are browser-side identifiers (not
secrets), but use your own Firebase project rather than shared credentials.

### Run

```bash
npm start     # dev server at http://localhost:3000
npm test      # run the test suite
npm run build # production build into ./build
```

## Movie data

Movie discovery and search call the companion backend under `/api/movies/*`.
The backend includes a TMDB proxy with validation, caching, and retries. Configure
`TMDB_ACCESS_TOKEN` (or `TMDB_API_KEY`) on the backend, and point the frontend's
`REACT_APP_API_URL` at that backend. Never put TMDB or Firebase Admin credentials
in frontend environment variables. Without a configured provider, movie routes
return a structured error and the UI displays an error message.

## Testing

```bash
npm test -- --watchAll=false
npm run build
```

Tests cover the movie API service's request contract
([`src/functions/api_service.test.tsx`](src/functions/api_service.test.tsx)) and
review-form validation
([`src/components/movie_details/ReviewForm.test.tsx`](src/components/movie_details/ReviewForm.test.tsx)).
CI runs install → test → build on every push and pull request
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

The production build also runs Create React App's ESLint and TypeScript checks;
CI treats build warnings as failures. After dependency changes, regenerate the
lockfile with npm 10 and verify `npm ci` before committing both package files.

## Reviewer guide

- [Movie API client](src/functions/api_service.tsx): typed request contracts and
  safe API error messages, with focused [tests](src/functions/api_service.test.tsx).
- [Backend client](src/functions/firebase_backend.ts): authenticated activity
  requests; the backend enforces authorization and ownership.
- [Review form](src/components/movie_details/ReviewForm.tsx): validation and
  submission feedback, with [tests](src/components/movie_details/ReviewForm.test.tsx).
- [Backend integration tests](https://github.com/thomasdevtran/vision_bucket_backend/blob/main/test/integration/api.emulator.test.js):
  Firebase emulator coverage of authentication and cross-user access.

The frontend suite is focused unit/component coverage, not a complete end-to-end
test of every screen. The browser-local demo is a portfolio preview, not evidence
of production scale or real community activity.

## Project structure

```
src/
  components/   Reusable UI (header, footer, profile, reviews, discussion)
  pages/        Route-level views (home, auth, profile, discussions, movie details)
  functions/    API clients and Firebase setup (api_service, firebase_backend)
  context/      Auth context provider
  config.ts     API base URL
  index.tsx     Router + app entry
```

## My contributions

Vision Bucket started as a team project for a university course (UC Irvine,
Informatics 124). Since then I've substantially rebuilt and extended it on my own.
Across the frontend and the companion backend I:

- Built out the React/TypeScript UI — profiles, movie details, the reviews flow,
  discussion boards, and the authentication screens.
- Designed the secured REST backend (Express 5 + Firestore): Firebase ID-token
  authentication middleware, role-based authorization, per-resource ownership
  checks, CORS allow-listing, rate limiting, and structured request logging.
- Normalized the Firestore data model (deterministic `watch_entries` and
  top-level `comments`) and wrote a reversible, dry-run-first migration.
- Added the test suites (Jest on the frontend; unit + Firebase-emulator
  integration tests on the backend) and set up CI.

> This began as coursework; the security hardening, data-model normalization,
> migration, tests, and CI are extensions I did afterward.

## Related

- Backend API: [vision_bucket_backend](https://github.com/thomasdevtran/vision_bucket_backend)
