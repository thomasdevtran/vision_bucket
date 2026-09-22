import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from '../functions/session';
import { searchMovies, Movie } from '../functions/api_service';
import FilmCard from '../components/FilmCard';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import '../App.css';

export default function SearchResults() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [attempt, setAttempt] = useState(0);
  const { query = '' } = useParams();
  const navigate = useNavigate();
  useEffect(() => onAuthStateChanged(getAuth(), user => { if (!user) navigate('/auth'); }), [navigate]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    searchMovies(query).then(data => { if (active) setMovies(data.results); })
      .catch(() => { if (active) setError('Search is unavailable right now. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, attempt]);
  return <div className="App"><Header /><main className="page-main">
    <div className="page-heading"><div><h1>Results for “{query}”</h1><p>{loading ? 'Searching the movie catalog…' : !error ? movies.length + ' films found' : 'Movie search'}</p></div></div>
    {loading ? <p className="loading-state" role="status">Loading results…</p> : error ?
      <div className="error-state" role="alert"><p>{error}</p><button onClick={() => setAttempt(value => value + 1)}>Try again</button></div> :
      movies.length ? <div className="film-grid">{movies.map(movie => <FilmCard key={movie.id} movie={movie} />)}</div> :
      <p className="empty-state" role="status">No films found. Try a different title in the search box.</p>}
  </main><Footer /></div>;
}
