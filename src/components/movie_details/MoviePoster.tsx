import { posterUrl } from '../../functions/poster';
import React from 'react';

interface MoviePosterProps {
  posterPath: string;
  title: string;
  releaseDate: string;
  voteAverage: number;
}

const MoviePoster: React.FC<MoviePosterProps> = ({ posterPath, title, releaseDate, voteAverage }) => {
  return (
    <div className="movie-top-section">
      <div className="movie-poster">
        <img
          src={posterUrl(posterPath)}
          alt={title}
        />
      </div>
      <div className="movie-details-info">
        <h1>{title}</h1>
        <p><strong>Release Date:</strong> {releaseDate}</p>
        <p><strong>Average Rating:</strong> {voteAverage}/10</p>
      </div>
    </div>
  );
};

export default MoviePoster;