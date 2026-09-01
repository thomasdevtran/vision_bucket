import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../styles/profile.css';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import UserStats from '../components/profile/user_stats/UserStats';
import TVShowStats from '../components/profile/tv_show_stats/TVShowStats';
import MovieStats from '../components/profile/movie_stats/MovieStats';
import TVShowHistory from '../components/profile/tv_show_history/TVShowHistory';
import MovieHistory from '../components/profile/movie_history/MovieHistory';
import Reviews from '../components/profile/review_display/MovieReviewCard';
import { deleteReviewForUser, getReviewsForUser } from '../functions/firebase_backend';

interface Review {
  id: string;
  movieId: number;
  content: string;
  rating: number;
}

function Profile() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setReviews([]);
        setError('Please sign in to view your profile reviews.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const reviewData = await getReviewsForUser(user.uid);
        setReviews(reviewData);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
        setError('Unable to load reviews.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Remove review from backend and update state
  const removeReview = async (docId: string) => {
    const user = getAuth().currentUser;
    if (!user) return;

    try {
      await deleteReviewForUser(docId, user.uid);
      setReviews((prev) => prev.filter((review) => review.id !== docId));
      alert('Review deleted successfully!');
    } catch (err) {
      alert('Failed to delete review.');
      console.error(err);
    }
  };

  return (
    <div className="App profile-page">
      <Header />
      <main className="profile-main">
        <div className="stats-section">
          <UserStats />
          <div className="stats-panel">
            <TVShowStats />
            <MovieStats />
          </div>
        </div>

        <div className="history-panel">
          <TVShowHistory />
          <MovieHistory />
          <h2 className="profile-section-title">Reviews</h2>
          <div className="reviews-list">
            {loading ? (
              <p className="profile-loading">Loading...</p>
            ) : error ? (
              <p className="profile-error">{error}</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="profile-review-row">
                  <Reviews
                    movieId={review.movieId}
                    review={review.content}
                    rating={review.rating}
                  />
                  <button className="profile-delete-button" onClick={() => removeReview(review.id)}>
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
