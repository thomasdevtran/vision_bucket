import { demoGenres, demoMovies, demoMovie, demoPage } from '../demo/catalog';
import axios from 'axios';
import { API_BASE_URL, DEMO_MODE } from '../config';
import { Movie, MovieSearchResponse, Genre, GenreListResponse } from '../types';

const api = axios.create({ baseURL: API_BASE_URL });

export type { Movie, MovieSearchResponse, Genre, GenreListResponse };

export const searchMovies = async (query: string, page: number = 1): Promise<MovieSearchResponse> => {
  if (DEMO_MODE) return demoPage(demoMovies.filter(movie => movie.title.toLowerCase().includes(query.trim().toLowerCase())), page);
  const { data } = await api.get('/api/movies/search', { params: { q: query, page } });
  return data;
};

export const getMovieDetails = async (movieId: number): Promise<Movie> => {
  if (DEMO_MODE) return demoMovie(movieId);
  const { data } = await api.get(`/api/movies/${movieId}`);
  return data;
};

export const getPopularMovies = async (page: number = 1): Promise<MovieSearchResponse> => {
  if (DEMO_MODE) return demoPage(demoMovies, page);
  const { data } = await api.get('/api/movies/popular', { params: { page } });
  return data;
};

export const getGenres = async (): Promise<GenreListResponse> => {
  if (DEMO_MODE) return { genres: demoGenres };
  const { data } = await api.get('/api/movies/genres');
  return data;
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<MovieSearchResponse> => {
  if (DEMO_MODE) return demoPage(demoMovies.filter(movie => movie.genre_ids.includes(genreId)), page);
  const { data } = await api.get(`/api/movies/genre/${genreId}`, { params: { page } });
  return data;
};
