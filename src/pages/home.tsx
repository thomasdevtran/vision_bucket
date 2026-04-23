import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getMoviesByGenre, Movie } from '../functions/api_service';
import '../App.css';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const navigate = useNavigate();
  const auth = getAuth();

  // Action genre ID: 28, Comedy genre ID: 35
  const ACTION_GENRE_ID = 28;
  const COMEDY_GENRE_ID = 35;

  // Handle authentication and set username
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        const extractedUsername = user.email?.split('@')[0] || 'Unknown User';
        setUsername(extractedUsername);
        localStorage.setItem('username', extractedUsername); // Save username to localStorage
      } else {
        setIsLoggedIn(false);
        setUsername(null);
        localStorage.removeItem('username'); // Remove username if user logs out
        navigate('/auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Get action movies by genre ID
        const actionResponse = await getMoviesByGenre(ACTION_GENRE_ID);
        setActionMovies(actionResponse.results);
        
        // Get comedy movies by genre ID
        const comedyResponse = await getMoviesByGenre(COMEDY_GENRE_ID);
        setComedyMovies(comedyResponse.results);
      } catch (err) {
        setError('Failed to fetch movies');
        console.error(err);
      }
    };

    fetchMovies();
  }, []);

  // Initialize localStorage defaults
  useEffect(() => {
    if (!localStorage.getItem('movies')) {
      localStorage.setItem('movies', JSON.stringify([]));
    }
    if (!localStorage.getItem('shows')) {
      localStorage.setItem('shows', JSON.stringify([]));
    }
    if (!localStorage.getItem('reviews')) {
      localStorage.setItem('reviews', JSON.stringify([]));
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleCardClick = (id: number) => {
    navigate(`/show/${id}`); // Navigate to the movie details page
  };

  return (
    <div className="App">
      <Header />
      <main className="page-main">
        <section className="page-hero">
          <p className="page-kicker">Discover your next watch</p>
          <h1>Welcome back{username ? `, ${username}` : ''}.</h1>
          <p className="page-description">
            Explore curated shelves, save films to your lists, and keep your ratings and reviews in one
            polished space.
          </p>
        </section>

        <div className="movies-container">
          <section className="content-section">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Curated Picks</p>
                <h2>Action Movies</h2>
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            <div className="movies-grid">
            {actionMovies.map((movie) => (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => {
                  console.log('Movie Data:', movie);
                  handleCardClick(movie.id);
                }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p>{movie.release_date}</p>
                  <p>Rating: {movie.vote_average}/10</p>
                </div>
              </div>
            ))}
            </div>
          </section>

          <section className="content-section">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Lighter Nights</p>
                <h2>Comedy Movies</h2>
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            <div className="movies-grid">
            {comedyMovies.map((movie) => (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => {
                  console.log('Movie Data:', movie);
                  handleCardClick(movie.id);
                }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p>{movie.release_date}</p>
                  <p>Rating: {movie.vote_average}/10</p>
                </div>
              </div>
            ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
