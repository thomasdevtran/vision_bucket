import { demoRequest, DEMO_STORAGE_KEY, loadDemo, resetDemo } from './store';

beforeEach(() => localStorage.clear());
const send = (path: string, method: string, body?: unknown) => demoRequest<any>(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) });

test('real catalog uses a separate session without reinterpreting old fictional movie IDs', () => {
  localStorage.setItem('vision-bucket-demo-v1', JSON.stringify({ version: 1, entries: [{ movieId: '1001' }], reviews: [], discussions: [], news: [] }));
  expect(loadDemo().entries.map(entry => entry.movieId)).toEqual(['157336', '27205']);
  expect(localStorage.getItem('vision-bucket-demo-v1')).not.toBeNull();
});

test('tracking updates persist, replace a status, and can be removed', async () => {
  await send('/profile/update/Completed/add_movie', 'PUT', { movieId: 550, rating: 5, notes: 'A keeper' });
  expect(loadDemo().entries.find(e => e.movieId === '550')).toMatchObject({ status: 'Completed', rating: 5 });
  await send('/profile/update/Plan_to_watch/add_movie', 'PUT', { movieId: 550 });
  expect(loadDemo().entries.filter(e => e.movieId === '550')).toHaveLength(1);
  expect(loadDemo().entries.find(e => e.movieId === '550')?.notes).toBeUndefined();
  await send('/profile/update/Plan_to_watch/remove_movie', 'PUT', { movieId: 550 });
  expect(loadDemo().entries.some(e => e.movieId === '550')).toBe(false);
});

test('review lifecycle keeps the profile index consistent and protects sample members', async () => {
  const { id } = await send('/reviews/posting', 'POST', { movieId: 550, content: 'Worth a watch', rating: 4 });
  await send(`/reviews/${id}`, 'PATCH', { content: 'An updated take', rating: 5 });
  expect(await demoRequest(`/reviews/${id}`)).toMatchObject({ content: 'An updated take', rating: 5 });
  expect((await demoRequest<any>('/profile/data/portfolio-visitor')).reviews).toContain(id);
  await expect(send('/reviews/sample-community-review', 'DELETE')).rejects.toThrow('own');
  await send(`/reviews/${id}`, 'DELETE');
  expect((await demoRequest<any>('/profile/data/portfolio-visitor')).reviews).not.toContain(id);
});

test('discussion and comment lifecycle persists across reads', async () => {
  const { id } = await send('/discussions/posting', 'POST', { Title: 'Weekend picks', Description: 'What should I watch?' });
  const { comment } = await send(`/discussions/post/${id}/comment`, 'POST', { content: 'Interstellar!' });
  expect((await demoRequest<any>(`/discussions/post/${id}`)).Comments).toHaveLength(1);
  await send(`/discussions/comment/${id}/${comment.commentId}`, 'DELETE');
  expect((await demoRequest<any>(`/discussions/post/${id}`)).Comments).toHaveLength(0);
  await send(`/discussions/post/${id}`, 'DELETE');
  await expect(demoRequest(`/discussions/post/${id}`)).rejects.toThrow('not found');
  await expect(send('/news/posting', 'POST', { Title: 'News', Description: 'Story' })).rejects.toThrow('editors');
});

test('invalid input is rejected without corrupting existing state', async () => {
  await expect(send('/reviews/posting', 'POST', { movieId: 550, content: ' ', rating: 7 })).rejects.toThrow();
  expect(loadDemo().reviews).toHaveLength(26);
});

test('reset restores seeds and leaves unrelated site storage intact', async () => {
  localStorage.setItem('unrelated-key', 'keep');
  await send('/reviews/sample-visitor-review', 'DELETE');
  resetDemo();
  expect(loadDemo().reviews).toHaveLength(26);
  expect(localStorage.getItem('unrelated-key')).toBe('keep');
  localStorage.setItem(DEMO_STORAGE_KEY, '{broken');
  expect(loadDemo().entries).toHaveLength(2);
});

test('historical sample community dates are stable, varied, and in 2024–2025', () => {
  const first = loadDemo();
  expect(loadDemo()).toEqual(first);
  const dates = [
    ...first.reviews.map(review => review.date),
    ...first.discussions.flatMap(thread => [thread.Date, ...thread.Comments.map(comment => comment.date)]),
    ...first.news.map(thread => thread.Date),
  ];
  expect(dates.every(date => Date.parse(date) >= Date.parse('2024-01-01') && Date.parse(date) < Date.parse('2026-01-01'))).toBe(true);
  expect(new Set(first.reviews.map(review => review.date.slice(0, 4)))).toEqual(new Set(['2024', '2025']));
  expect(new Set(first.reviews.map(review => review.date)).size).toBeGreaterThan(20);
  expect(new Set(first.reviews.filter(review => review.uid !== 'portfolio-visitor').map(review => review.uid)).size).toBe(8);
  expect(first.discussions.every(thread => thread.Comments.every(comment => Date.parse(comment.date) >= Date.parse(thread.Date)))).toBe(true);
});

test('community upgrade preserves visitor edits and deleted starter items without duplicates', async () => {
  const old = loadDemo();
  delete old.communityVersion;
  old.reviews = old.reviews.filter(review => review.id === 'sample-community-review');
  old.reviews.push({ id: 'visitor-existing', movieId: 550, uid: 'portfolio-visitor', Author: 'Portfolio Visitor', content: 'Keep my real review', rating: 3, date: '2026-09-22T10:00:00.000Z' });
  old.entries[0].notes = 'Keep my private notes';
  old.discussions = old.discussions.filter(thread => thread.id === 'weekend-picks');
  old.discussions[0].Comments.push({ commentId: 'visitor-existing-comment', uid: 'portfolio-visitor', author: 'Portfolio Visitor', content: 'Keep my comment', date: '2026-09-22T10:00:00.000Z' });
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(old));

  const upgraded = loadDemo();
  expect(upgraded.entries).toEqual(old.entries);
  expect(upgraded.reviews.find(review => review.id === 'visitor-existing')).toEqual(old.reviews[1]);
  expect(upgraded.reviews.some(review => review.id === 'sample-visitor-review')).toBe(false);
  expect(upgraded.discussions.some(thread => thread.id === 'visitor-thread')).toBe(false);
  expect(upgraded.discussions[0].Comments).toContainEqual(old.discussions[0].Comments[1]);
  expect(upgraded.reviews).toHaveLength(26);
  expect(upgraded.discussions).toHaveLength(7);
  await send('/reviews/visitor-existing', 'PATCH', { content: 'Still editable', rating: 4 });
  expect(loadDemo().reviews).toHaveLength(26);
  expect(new Set(loadDemo().reviews.map(review => review.id)).size).toBe(26);
  expect(loadDemo().communityVersion).toBe(1);
});

test('new visitor reviews retain the real creation date', async () => {
  const before = Date.now();
  const { review } = await send('/reviews/posting', 'POST', { movieId: 27205, content: 'My new review', rating: 4 });
  expect(Date.parse(review.date)).toBeGreaterThanOrEqual(before);
  expect(Date.parse(review.date)).toBeLessThanOrEqual(Date.now());
});
