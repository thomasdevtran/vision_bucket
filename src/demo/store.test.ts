import { demoRequest, DEMO_STORAGE_KEY, loadDemo, resetDemo } from './store';

beforeEach(() => localStorage.clear());
const send = (path: string, method: string, body?: unknown) => demoRequest<any>(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) });

test('tracking updates persist, replace a status, and can be removed', async () => {
  await send('/profile/update/Completed/add_movie', 'PUT', { movieId: 1001, rating: 5, notes: 'A keeper' });
  expect(loadDemo().entries.find(e => e.movieId === '1001')).toMatchObject({ status: 'Completed', rating: 5 });
  await send('/profile/update/Plan_to_watch/add_movie', 'PUT', { movieId: 1001 });
  expect(loadDemo().entries.filter(e => e.movieId === '1001')).toHaveLength(1);
  expect(loadDemo().entries.find(e => e.movieId === '1001')?.notes).toBeUndefined();
  await send('/profile/update/Plan_to_watch/remove_movie', 'PUT', { movieId: 1001 });
  expect(loadDemo().entries.some(e => e.movieId === '1001')).toBe(false);
});

test('review lifecycle keeps the profile index consistent and protects sample members', async () => {
  const { id } = await send('/reviews/posting', 'POST', { movieId: 1001, content: 'Worth a watch', rating: 4 });
  await send(`/reviews/${id}`, 'PATCH', { content: 'An updated take', rating: 5 });
  expect(await demoRequest(`/reviews/${id}`)).toMatchObject({ content: 'An updated take', rating: 5 });
  expect((await demoRequest<any>('/profile/data/portfolio-visitor')).reviews).toContain(id);
  await expect(send('/reviews/sample-community-review', 'DELETE')).rejects.toThrow('own');
  await send(`/reviews/${id}`, 'DELETE');
  expect((await demoRequest<any>('/profile/data/portfolio-visitor')).reviews).not.toContain(id);
});

test('discussion and comment lifecycle persists across reads', async () => {
  const { id } = await send('/discussions/posting', 'POST', { Title: 'Weekend picks', Description: 'What should I watch?' });
  const { comment } = await send(`/discussions/post/${id}/comment`, 'POST', { content: 'Orbit Seven!' });
  expect((await demoRequest<any>(`/discussions/post/${id}`)).Comments).toHaveLength(1);
  await send(`/discussions/comment/${id}/${comment.commentId}`, 'DELETE');
  expect((await demoRequest<any>(`/discussions/post/${id}`)).Comments).toHaveLength(0);
  await send(`/discussions/post/${id}`, 'DELETE');
  await expect(demoRequest(`/discussions/post/${id}`)).rejects.toThrow('not found');
  await expect(send('/news/posting', 'POST', { Title: 'News', Description: 'Story' })).rejects.toThrow('editors');
});

test('invalid input is rejected without corrupting existing state', async () => {
  await expect(send('/reviews/posting', 'POST', { movieId: 1001, content: ' ', rating: 7 })).rejects.toThrow();
  expect(loadDemo().reviews).toHaveLength(2);
});

test('reset restores seeds and leaves unrelated site storage intact', async () => {
  localStorage.setItem('unrelated-key', 'keep');
  await send('/reviews/sample-visitor-review', 'DELETE');
  resetDemo();
  expect(loadDemo().reviews).toHaveLength(2);
  expect(localStorage.getItem('unrelated-key')).toBe('keep');
  localStorage.setItem(DEMO_STORAGE_KEY, '{broken');
  expect(loadDemo().entries).toHaveLength(2);
});
