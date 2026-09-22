import { posterUrl } from '../../functions/poster';
import React from 'react';
import MovieOverview from './MovieOverview';

interface MoviePosterProps {
  posterPath: string;
  title: string;
  releaseDate: string;
  voteAverage: number;
  overview: string;
}

const MoviePoster: React.FC<MoviePosterProps> = ({ posterPath, title, releaseDate, voteAverage, overview }) => {
  return (
    <div className="movie-top-section">
      <div className="movie-poster">
        <img
          src={posterUrl(posterPath)}
          alt={title}
        />
      </div>
      <div className="movie-details-info">
        <div className="movie-title-group">
          <h1>{title}</h1>
          <p className="movie-detail-meta">{releaseDate?.slice(0, 4)} <span>★ {voteAverage.toFixed(1)} / 10 on TMDB</span></p>
        </div>
        <MovieOverview overview={overview} />
      </div>
    </div>
  );
};

export default MoviePoster;
