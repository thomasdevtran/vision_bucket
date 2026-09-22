import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from '../functions/session';
import { getMoviesByGenre, Movie } from '../functions/api_service';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import FilmCard from '../components/FilmCard';
import '../App.css';

function FilmShelf({ title, movies }: { title: string; movies: Movie[] }) {
  const [page, setPage] = useState(0);
  const step = 5;
  const pageCount = Math.max(1, Math.ceil(movies.length / step));
  const start = page * step;
  const move = (direction: number) => setPage(current => (current + direction + pageCount) % pageCount);
  return <section className="film-shelf" aria-label={title + ' films'}>
    <div className="section-heading">
      <h2>{title}<span className="shelf-note">Popular now</span></h2>
      <div className="shelf-controls">
        <button onClick={() => move(-1)} disabled={movies.length <= step} aria-label={'Previous ' + title.toLowerCase() + ' films'}>←</button>
        <button onClick={() => move(1)} disabled={movies.length <= step} aria-label={'Next ' + title.toLowerCase() + ' films'}>→</button>
      </div>
    </div>
    {movies.length ? <div className="film-grid shelf-grid">{movies.slice(start, start + step).map(movie => <FilmCard key={movie.id} movie={movie} />)}</div> :
      <p className="empty-state">No films available in this category right now.</p>}
  </section>;
}

export default function Home() {
  const [action, setAction] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  useEffect(() => onAuthStateChanged(getAuth(), user => { if (!user) navigate('/auth'); }), [navigate]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([getMoviesByGenre(28), getMoviesByGenre(35)])
      .then(([a, c]) => { if (active) { setAction(a.results); setComedy(c.results); } })
      .catch(() => { if (active) setError('Movies could not be loaded. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  return <div className="App"><Header /><main className="page-main">
    <div className="page-heading">
      <div><h1>A good film is worth finding.</h1><p>Explore movies, keep a watchlist, and share what you think.</p></div>
      <Link className="page-heading-link" to="/profile">Your watchlist →</Link>
    </div>
    {loading ? <p className="loading-state shelf-loading" role="status">Loading films…</p> : error ?
      <div className="error-state" role="alert"><p>{error}</p><button onClick={() => setAttempt(value => value + 1)}>Try again</button></div> :
      <><FilmShelf title="Action" movies={action} /><FilmShelf title="Comedy" movies={comedy} /></>}
  </main><Footer /></div>;
}
