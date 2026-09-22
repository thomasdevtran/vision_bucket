import { Link } from 'react-router-dom';
import { Movie } from '../functions/api_service';
import { posterUrl } from '../functions/poster';

export default function FilmCard({ movie }: { movie: Movie }) {
  return <Link className="film-card" to={'/show/' + movie.id}>
    <img src={posterUrl(movie.poster_path)} alt="" loading="lazy" width="300" height="450" />
    <h3>{movie.title}</h3>
    <div className="film-card-meta">
      <span>{movie.release_date?.slice(0, 4) || 'Release TBA'}</span>
      <span className="film-rating"><span aria-hidden="true">★ </span>{movie.vote_average.toFixed(1)}<small> / 10</small></span>
    </div>
  </Link>;
}

