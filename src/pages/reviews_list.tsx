import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { getPopularMovies } from '../functions/api_service';
import { AppReview, getReviewsForMovie, getErrorMessage } from '../functions/firebase_backend';
export default function ReviewsList() {
  const [reviews, setReviews] = useState<Array<AppReview & { title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getPopularMovies().then(async ({ results }) => {
      const groups = await Promise.all(results.slice(0, 12).map(async movie => (await getReviewsForMovie(movie.id)).map(review => ({ ...review, title: movie.title }))));
      if (active) setReviews(groups.flat());
    }).catch(error => { if (active) setError(getErrorMessage(error, 'Unable to load reviews.')); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <div className="App"><Header /><main className="page-main"><h1>Community reviews</h1><p>Recent takes on films from the discovery shelves.</p>
    {loading ? <p>Loading reviews…</p> : error ? <p role="alert">{error}</p> : reviews.length ? reviews.map(review => <article className="review-card" key={review.id}><h2><Link to={'/show/' + review.movieId}>{review.title}</Link></h2><p>{review.Author} · {review.rating}/5</p><p>{review.content}</p></article>) : <p>No reviews yet. Choose a film and share your first take.</p>}
  </main><Footer /></div>;
}
