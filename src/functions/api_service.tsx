import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Movie, MovieSearchResponse, Genre, GenreListResponse } from '../types';

const api = axios.create({ baseURL: API_BASE_URL });

export type { Movie, MovieSearchResponse, Genre, GenreListResponse };

// Turn an API failure into a user-friendly message. The backend masks the text
// of 5xx errors but preserves a machine-readable `code`, so we map the known
// codes explicitly and otherwise surface safe (4xx) messages, falling back to a
// generic string.
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: { code?: string; message?: string } } | undefined;
    const details = data?.error;
    if (details?.code === 'movie_provider_not_configured') {
      return 'Movie service is not configured yet. Add TMDB_ACCESS_TOKEN (or TMDB_API_KEY) on the server.';
    }
    if (details?.code === 'movie_provider_unavailable') {
      return 'The movie service is temporarily unavailable. Please try again shortly.';
    }
    const status = error.response?.status;
    if (typeof details?.message === 'string' && details.message.trim() && status && status < 500) {
      return details.message;
    }
  }
  return fallback;
};

export const searchMovies = async (query: string, page: number = 1): Promise<MovieSearchResponse> => {
  const { data } = await api.get('/api/movies/search', { params: { q: query, page } });
  return data;
};

export const getMovieDetails = async (movieId: number): Promise<Movie> => {
  const { data } = await api.get(`/api/movies/${movieId}`);
  return data;
};

export const getPopularMovies = async (page: number = 1): Promise<MovieSearchResponse> => {
  const { data } = await api.get('/api/movies/popular', { params: { page } });
  return data;
};

export const getGenres = async (): Promise<GenreListResponse> => {
  const { data } = await api.get('/api/movies/genres');
  return data;
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<MovieSearchResponse> => {
  const { data } = await api.get(`/api/movies/genre/${genreId}`, { params: { page } });
  return data;
};
