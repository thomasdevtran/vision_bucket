import {
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  getGenres,
  getMoviesByGenre,
} from './api_service';

// Capture the instance returned by axios.create() so we can assert on the
// exact request paths/params the movie service builds. `var` (not const/let)
// avoids the temporal-dead-zone error, since jest hoists the mock factory
// above these declarations.
// eslint-disable-next-line no-var
var mockGet: jest.Mock;
jest.mock('axios', () => {
  mockGet = jest.fn();
  return { __esModule: true, default: { create: () => ({ get: mockGet }) } };
});

beforeEach(() => {
  mockGet.mockReset();
});

test('searchMovies queries /api/movies/search with the term and page', async () => {
  mockGet.mockResolvedValue({ data: { page: 2, results: [], total_pages: 1, total_results: 0 } });

  const result = await searchMovies('matrix', 2);

  expect(mockGet).toHaveBeenCalledWith('/api/movies/search', { params: { q: 'matrix', page: 2 } });
  expect(result.page).toBe(2);
});

test('getPopularMovies defaults to page 1', async () => {
  mockGet.mockResolvedValue({ data: { page: 1, results: [], total_pages: 1, total_results: 0 } });

  await getPopularMovies();

  expect(mockGet).toHaveBeenCalledWith('/api/movies/popular', { params: { page: 1 } });
});

test('getMovieDetails requests a single movie by id', async () => {
  mockGet.mockResolvedValue({ data: { id: 603, title: 'The Matrix' } });

  const movie = await getMovieDetails(603);

  expect(mockGet).toHaveBeenCalledWith('/api/movies/603');
  expect(movie.title).toBe('The Matrix');
});

test('getMoviesByGenre passes the genre id in the path', async () => {
  mockGet.mockResolvedValue({ data: { page: 1, results: [], total_pages: 1, total_results: 0 } });

  await getMoviesByGenre(28, 3);

  expect(mockGet).toHaveBeenCalledWith('/api/movies/genre/28', { params: { page: 3 } });
});

test('getGenres requests the genre list', async () => {
  mockGet.mockResolvedValue({ data: { genres: [{ id: 28, name: 'Action' }] } });

  const { genres } = await getGenres();

  expect(mockGet).toHaveBeenCalledWith('/api/movies/genres');
  expect(genres).toHaveLength(1);
});
