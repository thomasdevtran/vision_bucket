import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { getMovieDetails, getPopularMovies } from '../functions/api_service';
import { AppReview, getReviewsForMovie, getErrorMessage } from '../functions/firebase_backend';
import { DEMO_MODE } from '../config';
import { loadDemo } from '../demo/store';
import { posterUrl } from '../functions/poster';
import '../styles/reviews_list.css';

type FeedReview = AppReview & { title: string; posterPath: string };
const loadReviews = async (): Promise<FeedReview[]> => {
  if (DEMO_MODE) {
    const reviews = loadDemo().reviews;
    const movieIds = Array.from(new Set(reviews.map(review => review.movieId)));
    const movies = new Map(await Promise.all(movieIds.map(async id => {
      // Keep local reviews readable if an individual movie lookup is unavailable.
      const movie = await getMovieDetails(id).catch(() => ({ title: `Movie ${id}`, poster_path: '' }));
      return [id, movie] as const;
    })));
    return reviews.map(review => ({ ...review, title: movies.get(review.movieId)!.title, posterPath: movies.get(review.movieId)!.poster_path || '' }));
  }
  const { results } = await getPopularMovies();
  const groups = await Promise.all(results.slice(0, 12).map(async movie =>
    (await getReviewsForMovie(movie.id)).map(review => ({ ...review, title: movie.title, posterPath: movie.poster_path }))));
  return groups.flat();
};

export default function ReviewsList() {
  const [reviews, setReviews] = useState<FeedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    loadReviews().then(items => {
      if (active) setReviews(items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)));
    }).catch(error => { if (active) setError(getErrorMessage(error, 'Unable to load reviews.')); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <div className="App"><Header /><main className="page-main community-reviews">
    <div className="page-heading"><div><h1>Community reviews</h1>
    <p className="review-feed-note">{DEMO_MODE ? 'Sample members and reviews from 2024–2025, alongside your own. These are demo examples, not recovered database records.' : 'What other film lovers have been watching.'}</p></div></div>
    {loading ? <p className="loading-state" role="status">Loading reviews…</p> : error ? <p role="alert">{error}</p> : reviews.length ? reviews.map(review =>
      <article className="community-review-row" key={review.id}>
        <img className="feed-poster" src={posterUrl(review.posterPath)} alt="" loading="lazy" />
        <div><h2><Link to={'/show/' + review.movieId}>{review.title}</Link></h2>
          <div className="feed-meta"><span>{review.Author}</span><span className="feed-score">★ {review.rating}<span aria-hidden="true"> / 5</span></span><time dateTime={review.date}>{new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</time></div>
          <p className="feed-review-text">{review.content}</p></div>
      </article>) : <p className="empty-state">No reviews yet. Choose a film and share your first take.</p>}
  </main><Footer /></div>;
}
