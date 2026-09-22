import { posterUrl } from '../functions/poster';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from '../functions/session';
import { searchMovies, Movie } from '../functions/api_service';
import '../App.css';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';


function SearchResults() {
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
        if (!user) {
          navigate('/auth');
        }
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, [auth, navigate]);
    
    useEffect(() => {
      const fetchMovies = async () => {
        if (!query) return;
        setError(null);
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
            {!error && movies.length === 0 && <p role="status">No movies match this search. Try another title, such as Inception.</p>}
            <div className="movies-grid">
              {movies.map((movie) => (
                <div 
                  key={movie.id} 
                  onClick={() => {
                    console.log('Movie Data:', movie);
                    handleCardClick(movie.id);
                  }}
                  className="movie-card"
                  role="link"
                  tabIndex={0}
                  onKeyDown={event => { if (event.key === "Enter") handleCardClick(movie.id); }}
                >
                  <img 
                    src={posterUrl(movie.poster_path)}
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
