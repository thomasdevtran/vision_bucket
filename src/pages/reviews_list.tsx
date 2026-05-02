import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { getMovieDetails, Movie } from '../functions/api_service';
import { API_BASE_URL } from '../config';
import '../styles/reviews_list.css';

interface ReviewEntry {
  id: string;
  movieId: number;
  content: string;
  rating: number;
  Author: string;
  date: string;
}

interface ReviewWithMovie extends ReviewEntry {
  movie: Movie | null;
}

const STAR_LABELS = ['', '★', '★★', '★★★', '★★★★', '★★★★★'];

function ReviewsList() {
  const [reviews, setReviews] = useState<ReviewWithMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/profile/reviews/${user.uid}`);
        if (!res.ok) throw new Error('Failed to load reviews');
        const reviewIds: string[] = await res.json();

        const fetched: ReviewWithMovie[] = await Promise.all(
          reviewIds.map(async (reviewId) => {
            const r = await fetch(`${API_BASE_URL}/reviews/review/${reviewId}`);
            const entry: ReviewEntry = await r.json();
            let movie: Movie | null = null;
            try {
              movie = await getMovieDetails(entry.movieId);
            } catch {
              // movie stays null if TMDB fails
            }
            return { ...entry, movie };
          })
        );

        setReviews(fetched);
      } catch (err) {
        setError('Could not load your reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="App">
      <Header />
      <div className="reviews-list-page">
        <h1 className="reviews-list-heading">My Reviews</h1>

        {loading && <p className="reviews-list-status">Loading your reviews…</p>}
        {error && <p className="reviews-list-status reviews-list-error">{error}</p>}

        {!loading && !error && reviews.length === 0 && (
          <p className="reviews-list-status">You haven't written any reviews yet.</p>
        )}

        <div className="reviews-list-grid">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="review-entry-card"
              onClick={() => r.movie && navigate(`/show/${r.movie.id}`)}
              style={{ cursor: r.movie ? 'pointer' : 'default' }}
            >
              {r.movie ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${r.movie.poster_path}`}
                  alt={r.movie.title}
                  className="review-entry-poster"
                />
              ) : (
                <div className="review-entry-poster review-entry-poster--missing" />
              )}
              <div className="review-entry-body">
                <h3 className="review-entry-title">{r.movie?.title ?? `Movie #${r.movieId}`}</h3>
                <span className="review-entry-stars" aria-label={`${r.rating} out of 5 stars`}>
                  {STAR_LABELS[r.rating] ?? ''}
                </span>
                <p className="review-entry-content">{r.content}</p>
                {r.date && <span className="review-entry-date">{r.date}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ReviewsList;
