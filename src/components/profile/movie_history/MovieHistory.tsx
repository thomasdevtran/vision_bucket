import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/profile.css';
import { getMovieDetails, Movie } from '../../../functions/api_service';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getWatchEntries, WatchEntry } from '../../../functions/firebase_backend';

interface TrackedMovie {
    movie: Movie;
    entry: WatchEntry;
}

function MovieHistory() {
    const [movies, setMovies] = useState<TrackedMovie[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    const handleCardClick = (id: number) => {
        navigate(`/show/${id}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="movie-history">
            <h1>Movie History</h1>
            {error && <p className="history-error">{error}</p>}
            <div className='history-container'>
                <div className="movies-grid">
                    {movies.map(({ movie, entry }) => (
                        <div
                            key={movie.id}
                            className="movie-card"
                            onClick={() => handleCardClick(movie.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleCardClick(movie.id);
                                }
                            }}
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="history-poster"
                            />
                            <h3>{movie.title}</h3>
                            <p>{movie.release_date}</p>
                            <p>{entry.status.replace(/_/g, ' ')}</p>
                            {entry.rating !== undefined && <p>Your rating: {entry.rating}/5</p>}
                            {entry.progress !== undefined && <p>Progress: {entry.progress}%</p>}
                        </div>
                    ))}
                    {!movies.length && !error && <p className="history-empty">Your tracked movies will appear here.</p>}
                </div>
            </div>
        </div>
    );
}

export default MovieHistory;
