import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieDetails, Movie } from '../functions/api_service';
import '../styles/MovieDetails.css';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import ReviewCard from '../components/movie_details/reviews_card';
import MoviePoster from '../components/movie_details/MoviePoster';
import MovieOverview from '../components/movie_details/MovieOverview';
import ReviewForm from '../components/movie_details/ReviewForm';
import AddToList from '../components/movie_details/AddToList';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import blue_circle from '../assets/circles/blue_circle.png';
import yellow_circle from '../assets/circles/yellow_circle.png';
import red_circle from '../assets/circles/red_circle.png';
import grey_circle from '../assets/circles/grey_circle.png';
import {
  createReview,
  deleteReviewForUser,
  getErrorMessage,
  getReviewsForMovie,
  getWatchEntries,
  removeWatchEntry,
  saveWatchEntry,
  updateReview,
  WatchStatus,
} from '../functions/firebase_backend';

const STATUS_OPTIONS = [
  { value: 'Plan_to_watch', label: 'Plan to Watch', icon: grey_circle },
  { value: 'Completed', label: 'Completed', icon: blue_circle },
  { value: 'Rewatched', label: 'Rewatched', icon: blue_circle },
  { value: 'On_hold', label: 'On-hold', icon: yellow_circle },
  { value: 'Dropped', label: 'Dropped', icon: red_circle },
] as const;

interface FirestoreReview {
  id: string;
  movieId: number;
  Author: string;
  content: string;
  rating: number;
  uid?: string;
  date: string;
}

function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<WatchStatus>('Plan_to_watch');
  const [hasWatchEntry, setHasWatchEntry] = useState(false);
  const [watchedAt, setWatchedAt] = useState('');
  const [personalRating, setPersonalRating] = useState('');
  const [progress, setProgress] = useState('');
  const [notes, setNotes] = useState('');
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [trackingMessage, setTrackingMessage] = useState<string | null>(null);
  const [firestoreReviews, setFirestoreReviews] = useState<FirestoreReview[]>([]);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingReviewText, setEditingReviewText] = useState('');
  const [editingReviewRating, setEditingReviewRating] = useState(1);
  const [reviewActionError, setReviewActionError] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieDetails = await getMovieDetails(Number(id));
        setMovie(movieDetails);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        setError('Failed to fetch movie details');
      }
    };

    fetchMovie();
  }, [id]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const entries = await getWatchEntries(firebaseUser.uid);
          const entry = entries.find((item) => String(item.movieId) === String(id));
          if (entry) {
            setSelectedStatus(entry.status);
            setWatchedAt(entry.watchedAt?.slice(0, 10) || '');
            setPersonalRating(entry.rating === undefined ? '' : String(entry.rating));
            setProgress(entry.progress === undefined ? '' : String(entry.progress));
            setNotes(entry.notes || '');
            setHasWatchEntry(true);
          } else {
            setHasWatchEntry(false);
          }
        } catch (err) {
          setTrackingMessage(getErrorMessage(err, 'Unable to load your tracking details.'));
        }
      } else {
        setHasWatchEntry(false);
      }
    });
    return () => unsubscribe();
  }, [id]);

  // Fetch reviews for this movie from backend
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        const data = await getReviewsForMovie(Number(id));
        setFirestoreReviews(data);
      } catch (err) {
        setFirestoreReviews([]);
      }
    };
    fetchReviews();
  }, [id]);

  // Post a review
  const handleReviewSubmit = async (reviewText: string, rating: number) => {
    if (!user) {
      throw new Error('Sign in to post a review.');
    }
    try {
      const data = await createReview({
        movieId: Number(id),
        Author: user.displayName || user.email || 'Anonymous',
        content: reviewText,
        rating,
        uid: user.uid,
      });
      setFirestoreReviews((prev) => [data, ...prev]);
      alert('Review submitted successfully!');
    } catch (err) {
      console.error(err);
      throw new Error(getErrorMessage(err, 'Failed to submit review.'));
    }
  };

  // Remove a review
  const handleDeleteReview = async (reviewId: string, reviewUid?: string) => {
    if (!user || user.uid !== reviewUid) {
      alert('You can only delete your own reviews.');
      return;
    }
    try {
      await deleteReviewForUser(reviewId, user.uid);
      setFirestoreReviews((prev) => prev.filter((r) => r.id !== reviewId));
      alert('Review deleted successfully!');
    } catch (err) {
      alert('Failed to delete review.');
      console.error(err);
    }
  };

  const startEditingReview = (review: FirestoreReview) => {
    setEditingReviewId(review.id);
    setEditingReviewText(review.content);
    setEditingReviewRating(review.rating);
    setReviewActionError('');
  };

  const handleUpdateReview = async () => {
    if (!editingReviewId || !editingReviewText.trim()) return;
    try {
      await updateReview(editingReviewId, {
        content: editingReviewText.trim(),
        rating: editingReviewRating,
      });
      setFirestoreReviews((reviews) => reviews.map((review) => review.id === editingReviewId
        ? { ...review, content: editingReviewText.trim(), rating: editingReviewRating }
        : review));
      setEditingReviewId(null);
      setReviewActionError('');
    } catch (updateError) {
      setReviewActionError(getErrorMessage(updateError, 'Unable to update your review.'));
    }
  };

  const handleSaveTracking = async () => {
    if (!user) {
      setTrackingMessage('Sign in to track this movie.');
      return;
    }
    const rating = personalRating === '' ? undefined : Number(personalRating);
    const progressValue = progress === '' ? undefined : Number(progress);
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      setTrackingMessage('Your rating must be between 1 and 5.');
      return;
    }
    if (progressValue !== undefined && (progressValue < 0 || progressValue > 100)) {
      setTrackingMessage('Progress must be between 0 and 100.');
      return;
    }

    setTrackingBusy(true);
    setTrackingMessage(null);
    try {
      await saveWatchEntry(user.uid, Number(id), {
        status: selectedStatus,
        ...(watchedAt ? { watchedAt: new Date(`${watchedAt}T00:00:00`).toISOString() } : {}),
        ...(rating !== undefined ? { rating } : {}),
        ...(progressValue !== undefined ? { progress: progressValue } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      setHasWatchEntry(true);
      setTrackingMessage('Tracking details saved.');
    } catch (err) {
      setTrackingMessage(getErrorMessage(err, 'Unable to save tracking details.'));
    } finally {
      setTrackingBusy(false);
    }
  };

  const handleRemoveTracking = async () => {
    if (!user || !hasWatchEntry) return;
    setTrackingBusy(true);
    setTrackingMessage(null);
    try {
      await removeWatchEntry(user.uid, Number(id), selectedStatus);
      setHasWatchEntry(false);
      setWatchedAt('');
      setPersonalRating('');
      setProgress('');
      setNotes('');
      setTrackingMessage('Movie removed from your library.');
    } catch (err) {
      setTrackingMessage(getErrorMessage(err, 'Unable to remove this movie.'));
    } finally {
      setTrackingBusy(false);
    }
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!movie) {
    return <p>Loading...</p>;
  }

  return (
    <div className="movie-details-page">
      <Header />
      <main className="details-layout">
        <section className="details-feed">
          <article className="movie-thread-card">
            <div className="thread-topline">
              <span className="thread-community">{movie.title}</span>
              <span className="thread-separator">•</span>
              <span className="thread-age">Movie discussion</span>
            </div>

            <MoviePoster
              posterPath={movie.poster_path}
              title={movie.title}
              releaseDate={movie.release_date}
              voteAverage={movie.vote_average}
            />

            <MovieOverview overview={movie.overview} />

            <div className="movie-actions">
              <div className="actions-heading">
                <h2>Track this movie</h2>
                <p>Set a status or add it to your list so it stays in your profile.</p>
              </div>

              <div className="movie-status-group">
                {STATUS_OPTIONS.map((option) => (
                  <label key={option.value} className={`status-option ${selectedStatus === option.value ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="movie-status"
                      value={option.value}
                      checked={selectedStatus === option.value}
                      onChange={() => setSelectedStatus(option.value)}
                    />
                    <img src={option.icon} alt={option.label} className="status-icon" />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              <div className="tracking-fields">
                <label>
                  Watched date
                  <input type="date" value={watchedAt} onChange={(event) => setWatchedAt(event.target.value)} />
                </label>
                <label>
                  Your rating
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="1"
                    placeholder="1–5"
                    value={personalRating}
                    onChange={(event) => setPersonalRating(event.target.value)}
                  />
                </label>
                <label>
                  Progress
                  <div className="progress-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="0"
                      value={progress}
                      onChange={(event) => setProgress(event.target.value)}
                    />
                    <span>%</span>
                  </div>
                </label>
                <label className="tracking-notes">
                  Private notes
                  <textarea
                    rows={3}
                    maxLength={1000}
                    placeholder="Anything you want to remember about this watch…"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </label>
              </div>

              <div className="movie-list-actions">
                <button onClick={handleSaveTracking} className="movie-list-button add" disabled={trackingBusy}>
                  {trackingBusy ? 'Saving…' : hasWatchEntry ? 'Update tracking' : 'Save to library'}
                </button>
                {hasWatchEntry && (
                  <button onClick={handleRemoveTracking} className="movie-list-button remove" disabled={trackingBusy}>
                    Remove
                  </button>
                )}
              </div>
              {trackingMessage && <p className="tracking-message" role="status">{trackingMessage}</p>}

              <AddToList movieId={Number(id)} user={user} />
            </div>
          </article>

          <section className="composer-card">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Share your take</p>
                <h2>Write a review</h2>
              </div>
              <p className="section-helper">Keep it thoughtful, short, and honest.</p>
            </div>
            <ReviewForm onSubmit={handleReviewSubmit} />
          </section>

          <section className="reviews-section">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Community reactions</p>
                <h2>Reviews</h2>
              </div>
              <p className="section-helper">{firestoreReviews.length} posts</p>
            </div>

            <div className="reviews-list">
              {firestoreReviews.length > 0 ? (
                firestoreReviews.map((review, index) => (
                  <div key={review.id} className="review-item">
                    {editingReviewId === review.id ? (
                      <div className="review-edit-form">
                        <textarea
                          rows={4}
                          value={editingReviewText}
                          onChange={(event) => setEditingReviewText(event.target.value)}
                        />
                        <select
                          value={editingReviewRating}
                          onChange={(event) => setEditingReviewRating(Number(event.target.value))}
                        >
                          {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                        </select>
                        <div className="review-edit-actions">
                          <button className="review-form-submit" onClick={handleUpdateReview}>Save changes</button>
                          <button className="review-action" onClick={() => setEditingReviewId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <ReviewCard
                        review={review.content}
                        author={review.Author}
                        rating={review.rating}
                        index={index}
                      />
                    )}
                    {user && user.uid === review.uid && editingReviewId !== review.id && (
                      <div className="review-owner-actions">
                        <button onClick={() => startEditingReview(review)} className="review-action">Edit</button>
                        <button
                          onClick={() => handleDeleteReview(review.id, review.uid)}
                          className="review-delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No reviews yet</h3>
                  <p>Be the first to post something thoughtful about this movie.</p>
                </div>
              )}
            </div>
            {reviewActionError && <p className="review-form-error" role="alert">{reviewActionError}</p>}
          </section>
        </section>

        <aside className="details-sidebar">
          <div className="sidebar-card">
            <p className="sidebar-label">Up next</p>
            <h3>Movie snapshot</h3>
            <p>
              {movie.title} is currently sitting at a {movie.vote_average.toFixed(1)}/10 average rating
              on TMDB.
            </p>
          </div>

          <div className="sidebar-card">
            <p className="sidebar-label">Posting style</p>
            <h3>Keep it readable</h3>
            <p>
              Use short paragraphs and clear opinions. The feed works best when reviews feel like real
              comments, not long form essays.
            </p>
          </div>

          <div className="sidebar-card subtle">
            <p className="sidebar-label">Status legend</p>
            <ul className="status-legend">
              {STATUS_OPTIONS.map((option) => (
                <li key={option.value}>
                  <img src={option.icon} alt="" className="status-icon" />
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
export default MovieDetails;
