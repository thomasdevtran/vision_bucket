import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { getMovieDetails, Movie } from '../functions/api_service';
import {
  DiaryEntry,
  deleteDiaryEntry,
  getDiary,
  getErrorMessage,
} from '../functions/firebase_backend';
import '../styles/diary.css';

const PAGE_SIZE = 20;

const monthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

const Stars = ({ rating }: { rating: number | null }) => {
  if (!rating) return null;
  return (
    <span className="diary-stars" aria-label={`${rating} out of 5`}>
      {'★'.repeat(rating)}
      <span className="diary-stars-empty">{'★'.repeat(5 - rating)}</span>
    </span>
  );
};

// Group already-sorted (newest-first) entries into consecutive month buckets.
const groupByMonth = (entries: DiaryEntry[]) => {
  const groups: { key: string; label: string; entries: DiaryEntry[] }[] = [];
  for (const entry of entries) {
    const key = entry.watchedAt.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.entries.push(entry);
    else groups.push({ key, label: monthLabel(entry.watchedAt), entries: [entry] });
  }
  return groups;
};

function Diary() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [movies, setMovies] = useState<Record<number, Movie>>({});
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Look up movie metadata for any newly-seen movieIds and cache it.
  const enrichMovies = useCallback((newEntries: DiaryEntry[]) => {
    setMovies((prev) => {
      const missing = Array.from(new Set(newEntries.map((entry) => entry.movieId)))
        .filter((movieId) => !(movieId in prev));
      missing.forEach(async (movieId) => {
        try {
          const details = await getMovieDetails(movieId);
          setMovies((current) => ({ ...current, [movieId]: details }));
        } catch {
          // Leave uncached; the card falls back to the raw movie id.
        }
      });
      return prev;
    });
  }, []);

  const loadPage = useCallback(async (uid: string, nextCursor: string | null) => {
    const page = await getDiary(uid, { cursor: nextCursor, limit: PAGE_SIZE });
    setEntries((prev) => (nextCursor ? [...prev, ...page.entries] : page.entries));
    setCursor(page.nextCursor);
    enrichMovies(page.entries);
  }, [enrichMovies]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setEntries([]);
        setError('Please sign in to view your viewing diary.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await loadPage(firebaseUser.uid, null);
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load your diary.'));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [loadPage]);

  const handleLoadMore = async () => {
    if (!user || !cursor) return;
    setLoadingMore(true);
    try {
      await loadPage(user.uid, cursor);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load more entries.'));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    try {
      await deleteDiaryEntry(entryId);
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete that entry.'));
    }
  };

  const groups = groupByMonth(entries);

  return (
    <div className="diary-page">
      <Header />
      <main className="diary-layout">
        <header className="diary-heading">
          <p className="diary-kicker">Viewing diary</p>
          <h1>Everything you have watched</h1>
          <p className="diary-subtitle">
            A chronological log of every film you have logged, rewatches included.
          </p>
        </header>

        {loading ? (
          <p className="diary-status">Loading your diary…</p>
        ) : error ? (
          <p className="diary-status diary-error" role="alert">{error}</p>
        ) : entries.length === 0 ? (
          <div className="diary-empty">
            <h2>No entries yet</h2>
            <p>Open a film and use “Log a watch” to start your diary.</p>
          </div>
        ) : (
          <>
            {groups.map((group) => (
              <section className="diary-month" key={group.key}>
                <h2 className="diary-month-label">{group.label}</h2>
                <ul className="diary-entries">
                  {group.entries.map((entry) => {
                    const movie = movies[entry.movieId];
                    return (
                      <li className="diary-entry" key={entry.id}>
                        <Link to={`/show/${entry.movieId}`} className="diary-poster">
                          {movie?.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                              alt={movie.title}
                            />
                          ) : (
                            <span className="diary-poster-fallback">🎬</span>
                          )}
                        </Link>
                        <div className="diary-entry-body">
                          <div className="diary-entry-top">
                            <Link to={`/show/${entry.movieId}`} className="diary-entry-title">
                              {movie?.title || `Movie #${entry.movieId}`}
                            </Link>
                            {entry.rewatch && <span className="diary-rewatch-badge">Rewatch</span>}
                          </div>
                          <p className="diary-entry-meta">
                            <span className="diary-date">{dayLabel(entry.watchedAt)}</span>
                            <Stars rating={entry.rating} />
                          </p>
                          {entry.notes && <p className="diary-notes">{entry.notes}</p>}
                        </div>
                        <button
                          className="diary-delete"
                          onClick={() => handleDelete(entry.id)}
                          aria-label="Delete entry"
                        >
                          Delete
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            {cursor && (
              <button className="diary-load-more" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Diary;
