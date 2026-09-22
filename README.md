# Vision Bucket

[Open the public portfolio demo](https://thomasdevtran.github.io/vision_bucket/) — no sign-in required.

A React + TypeScript movie-tracking and community app, paired with the Express/Firebase [backend](https://github.com/thomasdevtran/vision_bucket_backend).

## Portfolio demo — live movies, no sign-in

Use Node.js 22+. Start the backend with `npm run demo:movies` and a server-side `TMDB_ACCESS_TOKEN`. Set the frontend's `REACT_APP_API_URL` to that service (default: `http://localhost:5000`).

```sh
npm ci
npm run demo
```

For a static build:

```sh
npm run build:demo
npm run preview:demo
```

Open http://127.0.0.1:4173 after starting the preview. The demo includes real TMDB movies and posters, live search, watch tracking, editable reviews, profile statistics, discussions, and reset. Each visitor's changes stay in their browser. See [DEMO.md](DEMO.md) for hosting, a walkthrough, and suggested portfolio copy.

## Live integration

Copy .env.example to .env and supply your Firebase web app configuration and API URL. Run the backend with its own Firebase Admin credentials and TMDB access token, then use `npm start`. Movie discovery uses the real API in both modes. REACT_APP_DEMO_MODE=true makes only user activity browser-local. Review reads in the full application use the API, not direct Firestore access. Never place backend service-account credentials in the frontend.

## Verification

`npm test -- --watchAll=false` runs the frontend tests. `npm run build:demo` produces the static portfolio build. See the backend README for its unit and Firebase emulator integration suites.

Vision Bucket began as a university team project. Describe individual contributions separately from the original team work when presenting it.
