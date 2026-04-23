import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { searchMovies, Movie } from '../functions/api_service';
import '../App.css';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';


function SearchResults() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const navigate = useNavigate();
    const auth = getAuth();
    const { query } = useParams();
  
    const handleCardClick = (id: number) => {
      navigate(`/show/${id}`); // Navigate to the movie details page
  };

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsLoggedIn(true);
        } else {
          navigate('/auth');
        }
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, [auth]);
    
    useEffect(() => {
      const fetchMovies = async () => {
        if (!query) return;
        try {
          const response = await searchMovies(query);
          setMovies(response.results);
        } catch (err) {
          setError('Failed to fetch movies');
          console.error(err);
        }
      };
  
      fetchMovies();
    }, [query]);
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    return (
      <div className="App">
        <Header />
        <main className="page-main">
          <section className="page-hero compact">
            <p className="page-kicker">Search</p>
            <h1>Results for "{query}"</h1>
            <p className="page-description">
              Browse matching movies and jump straight into details, reviews, and watch tracking.
            </p>
          </section>
  
          <div className="movies-container">
            {error && <p className="error-text">{error}</p>}
            <div className="movies-grid">
              {movies.map((movie) => (
                <div 
                  key={movie.id} 
                  onClick={() => {
                    console.log('Movie Data:', movie);
                    handleCardClick(movie.id);
                  }}
                  className="movie-card"
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
          </div>
        </main>
        <Footer />
      </div>
    );
  }
export default SearchResults;
