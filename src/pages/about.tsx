import { Link } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { DEMO_MODE } from '../config';
import '../styles/demo.css';

export default function About() {
  return <div className="App"><Header /><main className="page-main about-content">
    <p className="page-kicker">Behind the project</p><h1>A home for your next watch.</h1>
    <p>Vision Bucket brings film discovery, personal watch tracking, reviews, and discussion together. It began as a university team project and grew into a full-stack portfolio project.</p>
    <h2>Try the complete journey</h2>
    <ol><li>Choose a film from the home page or search for “Inception”.</li><li>Save it to your library, add a rating, and leave a note.</li><li>Write a review, then visit your profile to see your history.</li><li>Open a discussion and add your own reply.</li></ol>
    {DEMO_MODE && <><h2>Your own demo session</h2><p>No sign-in is needed. Movie titles, posters, details, and catalog ratings come live from TMDB through our movie API. Sample members, reviews, and conversations demonstrate the community features. Your reviews, watchlist changes, and posts are saved only in this browser and are not shared with other visitors. Use Reset demo to restore the sample session.</p><p>The movie API is hosted on Vercel and the frontend on GitHub Pages. This preview does not demonstrate server-side user authentication. News publishing is reserved for editors in the full application.</p></>}
    <h2>Movie data</h2>
    <p>This product uses the TMDB API but is not endorsed or certified by TMDB. Movie metadata and images are provided by <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">The Movie Database</a>.</p>
    <h2>Two repositories, one application</h2>
    <p>The frontend uses React and TypeScript. The Express API provides Firebase token verification, ownership checks, Firestore persistence, movie discovery through TMDB, and API documentation. The backend also contains endpoints for lists, diary entries, recommendations, and social features that are not exposed in this preview.</p>
    <div className="about-actions"><a href="https://github.com/trollbro71/vision_bucket" target="_blank" rel="noreferrer">Frontend source ↗</a><a href="https://github.com/thomasdevtran/vision_bucket_backend" target="_blank" rel="noreferrer">Backend source ↗</a><Link to="/">Explore the films →</Link></div>
  </main><Footer /></div>;
}
