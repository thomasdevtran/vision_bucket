import React, { useEffect, useState } from 'react';
import { getMovieDetails, Movie } from '../../../functions/api_service';
import onestar from '../../../assets/1star.png';
import twostar from '../../../assets/2star.png';
import threestar from '../../../assets/3star.png';
import fourstar from '../../../assets/4star.png';
import fivestar from '../../../assets/5star.png';
import zerostar from '../../../assets/0star.png';
interface MovieReviewCardProps {
  movieId: number;
  review: string;
  rating: number;
}

const MovieReviewCard: React.FC<MovieReviewCardProps> = ({ movieId, review, rating }) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieDetails = await getMovieDetails(movieId);
        setMovie(movieDetails);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        setError('Failed to load movie details');
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  const getTempImage = (rating: number) => {
    switch (rating) {
      case 1:
        return onestar;
      case 2:
        return twostar;
      case 3:
        return threestar;
      case 4:
        return fourstar;
      case 5:
        return fivestar;
      default:
        return zerostar;
    }
  };

  if (error) {
    return <p className="history-error">{error}</p>;
  }

  return (
    <div className="profile-movie-review-card">
        <div className="profile-review-main">
          {movie ? (
            <>
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="profile-review-poster"
              />
              <h3>{movie.title}</h3>
            </>
          ) : (
            <p>Loading movie details...</p>
          )}
          <p><strong>Review:</strong> {review}</p>
          <p><strong>Rating:</strong> {rating}/5</p>
        </div>
        <div className="profile-review-stars">
        <img
          src={getTempImage(rating)}
          alt={`Rating ${rating}`}
          className="profile-stars-image"
        />
      </div>
    </div>
  );
};

export default MovieReviewCard;