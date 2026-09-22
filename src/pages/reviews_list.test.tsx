import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewsList from './reviews_list';
import { getMovieDetails, getPopularMovies } from '../functions/api_service';

jest.mock('../config', () => ({ DEMO_MODE: true }));
jest.mock('../components/header/header', () => () => null);
jest.mock('../components/footer/footer', () => () => null);
jest.mock('../functions/api_service', () => ({
  getMovieDetails: jest.fn(),
  getPopularMovies: jest.fn(),
}));
jest.mock('../functions/firebase_backend', () => ({
  getReviewsForMovie: jest.fn(),
  getErrorMessage: (_error: unknown, fallback: string) => fallback,
}));

test('demo review feed includes older films, shows dates, and resolves each title once', async () => {
  localStorage.clear();
  (getMovieDetails as jest.Mock).mockImplementation(async (id: number) => ({ id, title: `Film ${id}` }));
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ReviewsList /></MemoryRouter>);
  expect((await screen.findAllByRole('link', { name: 'Film 157336' })).length).toBe(4);
  expect(getPopularMovies).not.toHaveBeenCalled();
  expect(getMovieDetails).toHaveBeenCalledTimes(8);
  expect(screen.getByText(/not recovered database records/)).toBeInTheDocument();
  const dates = Array.from(document.querySelectorAll('time')).map(time => time.dateTime);
  expect(dates).toHaveLength(26);
  expect(dates).toEqual([...dates].sort().reverse());
});
