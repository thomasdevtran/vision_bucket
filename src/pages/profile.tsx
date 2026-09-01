import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import FollowSection from '../components/follow/FollowSection';
import { deleteReviewForUser, getDiary, getReviewsForUser } from '../functions/firebase_backend';
import MyLists from '../components/profile/my_lists/MyLists';

interface Review {
  id: string;
  movieId: number;
  content: string;
  rating: number;
  reactionCount?: number;
  reactedByMe?: boolean;
  isSpoiler?: boolean;
}

function Profile() {
  const { uid: routeUid } = useParams<{ uid: string }>();
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diaryCount, setDiaryCount] = useState(0);
  const [diaryLastWatched, setDiaryLastWatched] = useState<string | null>(null);

  // The profile being viewed: a route uid (another user) or the signed-in user.
  const profileUid = routeUid || currentUid;
  const isOwnProfile = !routeUid || routeUid === currentUid;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUid(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  // Diary summary reflects the signed-in user's own recent watches.
  useEffect(() => {
    if (!isOwnProfile || !currentUid) {
      setDiaryCount(0);
      setDiaryLastWatched(null);
      return;
    }
    let active = true;
    getDiary(currentUid, { limit: 50 })
      .then((diary) => {
        if (!active) return;
        setDiaryCount(diary.entries.length);
        setDiaryLastWatched(diary.entries[0]?.watchedAt ?? null);
      })
      .catch((err) => console.error('Failed to fetch diary summary', err));
    return () => {
      active = false;
    };
  }, [isOwnProfile, currentUid]);

  useEffect(() => {
    if (!profileUid) {
      if (!routeUid && currentUid === null) {
        setReviews([]);
        setError('Please sign in to view your profile reviews.');
        setLoading(false);
      }
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    getReviewsForUser(profileUid)
      .then((reviewData) => {
        if (active) setReviews(reviewData);
      })
      .catch((err) => {
        console.error('Failed to fetch reviews', err);
        if (active) setError('Unable to load reviews.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [profileUid, routeUid, currentUid]);

  // Remove review from backend and update state (only meaningful on your own profile).
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
          <UserStats uid={routeUid} />
          {isOwnProfile && (
            <div className="stats-panel">
              <TVShowStats />
              <MovieStats />
            </div>
          )}
        </div>

        {profileUid && <FollowSection targetUid={profileUid} />}

        <div className="history-panel">
          {isOwnProfile && (
            <>
              <Link to="/diary" className="diary-summary-card">
                <div>
                  <p className="diary-summary-kicker">Viewing diary</p>
                  <h2 className="diary-summary-title">
                    {diaryCount > 0
                      ? `${diaryCount}${diaryCount === 50 ? '+' : ''} recent ${diaryCount === 1 ? 'watch' : 'watches'} logged`
                      : 'Start your viewing diary'}
                  </h2>
                  {diaryLastWatched && (
                    <p className="diary-summary-meta">
                      Last watched {new Date(diaryLastWatched).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="diary-summary-cta">Open diary →</span>
              </Link>
              <MyLists />
              <TVShowHistory />
              <MovieHistory />
            </>
          )}
          <h2 className="profile-section-title">Reviews</h2>
          <div className="reviews-list">
            {loading ? (
              <p className="profile-loading">Loading...</p>
            ) : error ? (
              <p className="profile-error">{error}</p>
            ) : reviews.length === 0 ? (
              <p className="profile-loading">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="profile-review-row">
                  <Reviews
                    movieId={review.movieId}
                    review={review.content}
                    rating={review.rating}
                    reviewId={review.id}
                    reactionCount={review.reactionCount ?? 0}
                    reactedByMe={review.reactedByMe ?? false}
                    isSpoiler={review.isSpoiler ?? false}
                  />
                  {isOwnProfile && (
                    <button className="profile-delete-button" onClick={() => removeReview(review.id)}>
                      Delete
                    </button>
                  )}
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
