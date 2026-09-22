import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Movie, MovieSearchResponse, Genre, GenreListResponse } from '../types';

const api = axios.create({ baseURL: API_BASE_URL });

export type { Movie, MovieSearchResponse, Genre, GenreListResponse };

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
