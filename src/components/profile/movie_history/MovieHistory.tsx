import { posterUrl } from '../../../functions/poster';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../../styles/profile.css';
import { getMovieDetails, Movie } from '../../../functions/api_service';
import { getAuth, onAuthStateChanged } from '../../../functions/session';
import { getWatchEntries, WatchEntry } from '../../../functions/firebase_backend';

interface TrackedMovie {
    movie: Movie;
    entry: WatchEntry;
}

function MovieHistory() {
    const [movies, setMovies] = useState<TrackedMovie[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const entries = await getWatchEntries(user.uid);
                    const trackedMovies = await Promise.all(entries.map(async (entry) => ({
                        entry,
                        movie: await getMovieDetails(Number(entry.movieId)),
                    })));
                    setMovies(trackedMovies);
                } catch (err) {
                    console.error('Failed to fetch movies:', err);
                    setError('Failed to fetch movies');
                } finally {
                    setLoading(false);
                }
            } else {
                setMovies([]);
                setError('User not logged in');
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="movie-history">
            <h2 className="profile-section-title">Your films</h2>
            {error && <p className="history-error">{error}</p>}
            <div className='history-container'>
                <div className="movies-grid">
                    {movies.map(({ movie, entry }) => (
                        <Link
                            key={movie.id}
                            className="movie-card"
                            to={`/show/${movie.id}`}
                        >
                            <img
                                src={posterUrl(movie.poster_path)}
                                alt=""
                                className="history-poster"
                            />
                            <h3>{movie.title}</h3>
                            <p>{movie.release_date?.slice(0, 4)}</p>
                            <p>{entry.status.replace(/_/g, ' ')}</p>
                            {entry.rating !== undefined && <p>Your rating: {entry.rating}/5</p>}
                            {entry.progress !== undefined && <p>Progress: {entry.progress}%</p>}
                        </Link>
                    ))}
                    {!movies.length && !error && <p className="history-empty">Your tracked movies will appear here.</p>}
                </div>
            </div>
        </div>
    );
}

export default MovieHistory;
