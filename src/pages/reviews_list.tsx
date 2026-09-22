import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { getMovieDetails, getPopularMovies } from '../functions/api_service';
import { AppReview, getReviewsForMovie, getErrorMessage } from '../functions/firebase_backend';
import { DEMO_MODE } from '../config';
import { loadDemo } from '../demo/store';

const loadReviews = async (): Promise<Array<AppReview & { title: string }>> => {
  if (DEMO_MODE) {
    const reviews = loadDemo().reviews;
    const movieIds = Array.from(new Set(reviews.map(review => review.movieId)));
    const titles = new Map(await Promise.all(movieIds.map(async id => {
      // Keep local reviews readable if an individual movie lookup is unavailable.
      const title = await getMovieDetails(id).then(movie => movie.title).catch(() => `Movie ${id}`);
      return [id, title] as const;
    })));
    return reviews.map(review => ({ ...review, title: titles.get(review.movieId)! }));
  }
  const { results } = await getPopularMovies();
  const groups = await Promise.all(results.slice(0, 12).map(async movie =>
    (await getReviewsForMovie(movie.id)).map(review => ({ ...review, title: movie.title }))));
  return groups.flat();
};

export default function ReviewsList() {
  const [reviews, setReviews] = useState<Array<AppReview & { title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    loadReviews().then(items => {
      if (active) setReviews(items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)));
    }).catch(error => { if (active) setError(getErrorMessage(error, 'Unable to load reviews.')); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <div className="App"><Header /><main className="page-main"><h1>Community reviews</h1>
    <p>{DEMO_MODE ? 'Fictional members and sample reviews dated 2024–2025, alongside your own local reviews. These are demo examples, not recovered database records.' : 'Recent takes on films from the discovery shelves.'}</p>
    {loading ? <p>Loading reviews…</p> : error ? <p role="alert">{error}</p> : reviews.length ? reviews.map(review => <article className="review-card" key={review.id}><h2><Link to={'/show/' + review.movieId}>{review.title}</Link></h2><p>{review.Author} · {review.rating}/5 · <time dateTime={review.date}>{new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</time></p><p>{review.content}</p></article>) : <p>No reviews yet. Choose a film and share your first take.</p>}
  </main><Footer /></div>;
}
