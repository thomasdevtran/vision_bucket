# Vision Bucket

A full-stack movie tracking and community platform for film enthusiasts. Track your watch history, write reviews, and discuss films with others.

> **Live demo:** _coming soon — deploy your backend to Render/Railway, then deploy the frontend to Vercel and add the URL here._

---

## Features

- **Movie discovery** — Browse popular films and search the TMDB catalog
- **Watch status tracking** — Tag movies as Watching, Completed, On-hold, Dropped, or Plan to Watch
- **Reviews** — Write and rate movies (1–5 stars), view community reviews
- **Discussion boards** — Create threads and comment in General and News sections
- **User profiles** — Personal dashboard with watch history and review activity
- **Dark / Light mode** — Theme toggle that persists across sessions
- **Responsive design** — Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, React Router v6 |
| Auth | Firebase Authentication (email/password) |
| Movie data | TMDB API |
| Backend | Node.js / Express (separate repo) |
| Deployment | Vercel (frontend), Render/Railway (backend) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- A [Firebase project](https://console.firebase.google.com/) with Authentication enabled
- The backend server running (see backend repo)

### Installation

```bash
git clone https://github.com/<your-username>/vision-bucket.git
cd vision-bucket
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_TMDB_API_KEY=your_key
REACT_APP_TMDB_ACCESS_TOKEN=your_token
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...
```

### Run locally

```bash
npm start        # starts on http://localhost:3000
npm test         # run tests
npm run build    # production build
```

## Deployment

### Frontend (Vercel)

1. Push your repo to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add all `REACT_APP_*` environment variables in Vercel project settings
4. Set `REACT_APP_API_URL` to your deployed backend URL
5. Deploy — Vercel auto-deploys on every push to `main`

### Backend (Render / Railway)

Deploy the backend repo separately and copy the live URL into `REACT_APP_API_URL` in your Vercel settings.

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── header/        # Nav + search bar + theme toggle
│   ├── movie_details/ # Review form, review card, poster
│   ├── profile/       # Stats, history, review display
│   ├── discussion/    # Thread previews, comment form
│   ├── ErrorBoundary  # Global error boundary
│   └── Toast          # Toast notification system
├── context/
│   └── AuthContext    # Global Firebase auth state
├── functions/
│   └── api_service    # TMDB API helpers
├── pages/             # Route-level page components
├── styles/            # CSS stylesheets + themes.css
├── types/             # Shared TypeScript interfaces
└── config.ts          # Environment variable config
```
