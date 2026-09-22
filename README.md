# Vision Bucket

[Open the public portfolio demo](https://thomasdevtran.github.io/vision_bucket/) — no sign-in required.

A React + TypeScript movie-tracking and community app, paired with the Express/Firebase [backend](https://github.com/thomasdevtran/vision_bucket_backend).

## Portfolio demo — no sign-in or backend required

Use Node.js 22+.

```sh
npm ci
npm run demo
```

For a static build:

```sh
npm run build:demo
npm run preview:demo
```

Open http://127.0.0.1:4173 after starting the preview. The demo includes twelve fictional films, locally bundled artwork, watch tracking, editable reviews, profile statistics, discussions, and reset. Each visitor's changes stay in their browser. See [DEMO.md](DEMO.md) for hosting, a walkthrough, and suggested portfolio copy.

## Live integration

Copy .env.example to .env and supply your Firebase web app configuration and API URL. Run the backend with its own Firebase Admin credentials and optional TMDB access token, then use `npm start`. Normal builds use the real API unless REACT_APP_DEMO_MODE=true is explicitly set. Review reads use the API, not direct Firestore access. Never place backend service-account credentials in the frontend.

## Verification

`npm test -- --watchAll=false` runs the frontend tests. `npm run build:demo` produces the static portfolio build. See the backend README for its unit and Firebase emulator integration suites.

Vision Bucket began as a university team project. Describe individual contributions separately from the original team work when presenting it.
