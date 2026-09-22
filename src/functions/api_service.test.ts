import { getGenres, getMovieDetails, getMoviesByGenre, getPopularMovies, searchMovies } from './api_service';
import axios from 'axios';

jest.mock('../config', () => ({ API_BASE_URL: 'https://movies.example.test', DEMO_MODE: true }));
jest.mock('axios', () => {
  const get = jest.fn();
  return { create: () => ({ get }), get };
});

test('demo mode keeps every movie operation connected to the movie API', async () => {
  const get = axios.get as jest.Mock;
  const response = { source: 'live API' };
  get.mockResolvedValue({ data: response });
  expect(await searchMovies('Inception', 2)).toBe(response);
  expect(await getMovieDetails(27205)).toBe(response);
  expect(await getPopularMovies(2)).toBe(response);
  expect(await getGenres()).toBe(response);
  expect(await getMoviesByGenre(28, 2)).toBe(response);
  expect(get.mock.calls).toEqual([
    ['/api/movies/search', { params: { q: 'Inception', page: 2 } }],
    ['/api/movies/27205'],
    ['/api/movies/popular', { params: { page: 2 } }],
    ['/api/movies/genres'],
    ['/api/movies/genre/28', { params: { page: 2 } }],
  ]);
});
