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
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import green_circle from '../assets/circles/green_circle.png';
import blue_circle from '../assets/circles/blue_circle.png';
import yellow_circle from '../assets/circles/yellow_circle.png';
import red_circle from '../assets/circles/red_circle.png';
import grey_circle from '../assets/circles/grey_circle.png';
import {
  addMovieToUserList,
  createReview,
  deleteReviewForUser,
  getReviewsForMovie,
  getUserProfile,
  removeMovieFromUserList,
  setMovieStatus,
} from '../functions/firebase_backend';

const STATUS_OPTIONS = [
  { value: 'Watching', label: 'Watching', icon: green_circle },
  { value: 'Completed', label: 'Completed', icon: blue_circle },
  { value: 'On_hold', label: 'On-hold', icon: yellow_circle },
  { value: 'Dropped', label: 'Dropped', icon: red_circle },
  { value: 'Plan_to_watch', label: 'Plan to Watch', icon: grey_circle },
];

interface FirestoreReview {
  id: string;
  movieId: number;
  Author: string;
  content: string;
  rating: number;
  uid: string;
  date: string;
}

function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [inMovieList, setInMovieList] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [firestoreReviews, setFirestoreReviews] = useState<FirestoreReview[]>([]);

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
          const userData = await getUserProfile(firebaseUser.uid);
          const foundStatus = Object.entries(userData)
            .find(([status, arr]) => Array.isArray(arr) && arr.includes(Number(id)));
          if (foundStatus) setSelectedStatus(foundStatus[0]);
          setInMovieList((userData.movie_list || []).includes(Number(id)));
        } catch (err) {
          console.error('Failed to fetch user movie lists:', err);
        }
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
      alert('You must be logged in to post a review!');
      return;
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
      alert('Failed to submit review.');
      console.error(err);
    }
  };

  // Remove a review
  const handleDeleteReview = async (reviewId: string, reviewUid: string) => {
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

  // Add to movie_list in backend
  const handleAddToMovies = async () => {
    if (!user) {
      alert('You must be logged in to add movies.');
      return;
    }
    try {
      await addMovieToUserList(user.uid, Number(id));
      setInMovieList(true);
      alert('Movie added to your list!');
    } catch (err) {
      alert('Failed to add movie to your list.');
      console.error(err);
    }
  };

  // Remove from movie_list in backend
  const handleRemoveFromMovies = async () => {
    if (!user) {
      alert('You must be logged in to remove movies.');
      return;
    }
    try {
      await removeMovieFromUserList(user.uid, Number(id));
      setInMovieList(false);
      alert('Movie removed from your list!');
    } catch (err) {
      alert('Failed to remove movie from your list.');
      console.error(err);
    }
  };

  const fetchUserStatusLists = async (uid: string) => {
    try {
      const userData = await getUserProfile(uid);
      const foundStatus = Object.entries(userData)
        .find(([status, arr]) => Array.isArray(arr) && arr.includes(Number(id)));
      if (foundStatus) setSelectedStatus(foundStatus[0]);
      else setSelectedStatus('');
    } catch (err) {
      console.error('Failed to fetch user movie lists:', err);
    }
  };

  // Set status for this movie
  const handleSetStatus = async (newStatus: string) => {
    if (!user) {
      alert('You must be logged in to update movie status.');
      return;
    }
    try {
      await setMovieStatus(user.uid, Number(id), newStatus);
      await fetchUserStatusLists(user.uid);
      alert(`Movie set to "${newStatus.replace(/_/g, ' ')}"!`);
    } catch (err) {
      alert('Failed to update movie status.');
      console.error(err);
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
                      onChange={() => handleSetStatus(option.value)}
                    />
                    <img src={option.icon} alt={option.label} className="status-icon" />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              <div className="movie-list-actions">
                {inMovieList ? (
                  <button onClick={handleRemoveFromMovies} className="movie-list-button remove">
                    Remove from Movie List
                  </button>
                ) : (
                  <button onClick={handleAddToMovies} className="movie-list-button add">
                    Add to Movie List
                  </button>
                )}
              </div>
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
                    <ReviewCard
                      review={review.content}
                      author={review.Author}
                      rating={review.rating}
                      index={index}
                    />
                    {user && user.uid === review.uid && (
                      <button
                        onClick={() => handleDeleteReview(review.id, review.uid)}
                        className="review-delete-button"
                      >
                        Delete
                      </button>
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
