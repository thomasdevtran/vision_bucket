import { API_BASE_URL } from './config';

describe('config', () => {
  it('API_BASE_URL defaults to localhost when env var is not set', () => {
    // In the test environment REACT_APP_API_URL is not set, so the fallback applies
    expect(API_BASE_URL).toBe('http://localhost:5000');
  });
});
