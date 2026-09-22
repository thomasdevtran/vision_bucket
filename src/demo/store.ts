import type { AppReview, AppThread, WatchEntry, UserProfile, WatchStatus } from '../functions/firebase_backend';

export const DEMO_STORAGE_KEY = 'vision-bucket-demo-v2';
export const DEMO_UID = 'portfolio-visitor';
const statuses: WatchStatus[] = ['Completed', 'Dropped', 'On_hold', 'Plan_to_watch', 'Rewatched'];
interface DemoState { version: 2; entries: WatchEntry[]; reviews: AppReview[]; discussions: AppThread[]; news: AppThread[] }
const stamp = '2026-09-01T12:00:00.000Z';
const seed = (): DemoState => ({
  version: 2,
  entries: [
    { id: 'watch-157336', movieId: '157336', userId: DEMO_UID, status: 'Completed', rating: 4, watchedAt: stamp, notes: 'Loved the atmosphere and the ending.', progress: 100 },
    { id: 'watch-27205', movieId: '27205', userId: DEMO_UID, status: 'Plan_to_watch', notes: 'For the next movie night.' },
  ],
  reviews: [
    { id: 'sample-visitor-review', movieId: 157336, Author: 'Portfolio Visitor', uid: DEMO_UID, content: 'Sample review: Interstellar pairs a huge space adventure with a moving story about family.', rating: 4, date: stamp },
    { id: 'sample-community-review', movieId: 27205, Author: 'Maya · sample member', uid: 'sample-maya', content: 'Sample review: Inception is a great pick for a double feature. There is always another detail to notice.', rating: 5, date: stamp },
  ],
  discussions: [
    { id: 'weekend-picks', uid: 'sample-maya', Author: 'Maya · sample member', Date: stamp, Title: 'What makes a great movie-night double feature?', Description: 'I’m pairing Inception with Interstellar. What would you put together for your next movie night?', Comments: [{ commentId: 'sample-comment', uid: 'sample-jules', author: 'Jules · sample member', content: 'The Grand Budapest Hotel followed by Fantastic Mr. Fox.', date: stamp }] },
    { id: 'visitor-thread', uid: DEMO_UID, Author: 'Portfolio Visitor', Date: stamp, Title: 'My first watchlist', Description: 'Interstellar was a great start. Next up: Inception. Add your own picks below!', Comments: [] },
  ],
  news: [{ id: 'demo-guide', uid: 'sample-editor', Author: 'Vision Bucket', Date: stamp, Title: 'Welcome to the Vision Bucket screening room', Description: 'Explore real movies from TMDB, keep a watchlist, and leave a review. Movie discovery uses the live API; sample conversations and all your changes stay in this browser. Reset the demo any time to start fresh.', Comments: [] }],
});

export const loadDemo = (): DemoState => {
  try {
    const value = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || 'null');
    if (value?.version === 2 && ['entries', 'reviews', 'discussions', 'news'].every(key => Array.isArray(value[key]) && value[key].every((item: unknown) => item && typeof item === 'object'))) return value;
  } catch { /* Unavailable or outdated storage starts a fresh session. */ }
  return seed();
};

export const resetDemo = () => localStorage.removeItem(DEMO_STORAGE_KEY);
const save = (state: DemoState) => {
  try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state)); }
  catch { throw new Error('Your browser could not save this change. Enable site storage or free some space, then try again.'); }
};
const id = () => `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const own = (uid?: string) => { if (uid !== DEMO_UID) throw new Error('You can only change your own demo posts.'); };
const text = (value: unknown, max: number) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error(`Enter between 1 and ${max} characters.`);
  return value.trim();
};
const rating = (value: unknown) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 5) throw new Error('Rating must be an integer from 1 to 5.');
  return number;
};

export const demoRequest = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
  const state = loadDemo();
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(String(options.body)) : {};
  const now = new Date().toISOString();
  let result: unknown;
  if (parts[0] === 'profile') {
    if (parts[1] === 'data' && method === 'GET') {
      if (parts[2] !== DEMO_UID) throw new Error('This profile is not part of the demo.');
      const profile: UserProfile = { Username: 'Portfolio Visitor', username: 'Portfolio Visitor', Joined: stamp, Last_online: now, reviews: state.reviews.filter(r => r.uid === DEMO_UID).map(r => r.id), movie_list: state.entries.map(e => e.movieId), Completed: [], Dropped: [], On_hold: [], Plan_to_watch: [], Rewatched: [] };
      statuses.forEach(status => { profile[status] = state.entries.filter(e => e.status === status).map(e => e.movieId); });
      result = profile;
    } else if (parts[1] === 'watch_entries' && method === 'GET') result = state.entries;
    else if (parts[1] === 'update' && statuses.includes(parts[2] as WatchStatus) && method === 'PUT') {
      const movieId = String(body.movieId);
      const previous = state.entries.find(e => e.movieId === movieId);
      state.entries = state.entries.filter(e => e.movieId !== movieId);
      if (parts[3] === 'add_movie') {
        if (body.rating !== undefined) rating(body.rating);
        if (body.progress !== undefined && (!Number.isFinite(body.progress) || body.progress < 0 || body.progress > 100)) throw new Error('Progress must be from 0 to 100.');
        const entry: WatchEntry = { id: `watch-${movieId}`, movieId, userId: DEMO_UID, status: parts[2] as WatchStatus, createdAt: previous?.createdAt || now, updatedAt: now, watchedAt: body.watchedAt, rating: body.rating, progress: body.progress, notes: body.notes };
        state.entries.push(entry);
        result = { entry };
      } else if (parts[3] === 'remove_movie') result = { message: 'Removed' };
    } else if (parts[1] === 'create' || ['last_online', 'add_review', 'remove_review'].includes(parts[2])) result = { message: 'Saved', uid: DEMO_UID };
  } else if (parts[0] === 'reviews') {
    if (parts[1] === 'movie' && method === 'GET') result = state.reviews.filter(r => r.movieId === Number(parts[2]));
    else if (parts[1] === 'posting' && method === 'POST') {
      const review: AppReview = { id: id(), movieId: Number(body.movieId), Author: 'Portfolio Visitor', uid: DEMO_UID, date: now, content: text(body.content, 5000), rating: rating(body.rating) };
      state.reviews.push(review);
      result = { id: review.id, review };
    } else {
      const review = state.reviews.find(r => r.id === parts[1]);
      if (!review) throw new Error('Review not found.');
      if (method === 'GET') result = review;
      else {
        own(review.uid);
        if (method === 'DELETE') state.reviews = state.reviews.filter(r => r.id !== review.id);
        else if (method === 'PATCH') { review.content = text(body.content, 5000); review.rating = rating(body.rating); }
        else throw new Error('Unsupported review action.');
        result = { message: 'Saved' };
      }
    }
  } else if (parts[0] === 'discussions' || parts[0] === 'news') {
    const list = state[parts[0]];
    if (parts[1] === 'posts' && method === 'GET') result = list;
    else if (parts[1] === 'posting' && method === 'POST') {
      if (parts[0] === 'news') throw new Error('Only editors can publish news.');
      const thread: AppThread = { id: id(), uid: DEMO_UID, Author: 'Portfolio Visitor', Date: now, Title: text(body.Title, 200), Description: text(body.Description, 5000), Comments: [] };
      list.push(thread);
      result = { id: thread.id };
    } else {
      const thread = list.find(t => t.id === parts[2]);
      if (!thread) throw new Error('Discussion not found.');
      if (method === 'GET') result = thread;
      else if (parts[3] === 'comment' && method === 'POST') {
        const comment = { commentId: id(), uid: DEMO_UID, author: 'Portfolio Visitor', content: text(body.content, 5000), date: now };
        thread.Comments.push(comment);
        result = { comment };
      } else if (parts[1] === 'comment' && method === 'DELETE') {
        const comment = thread.Comments.find(c => c.commentId === parts[3]);
        if (!comment) throw new Error('Comment not found.');
        own(comment.uid);
        thread.Comments = thread.Comments.filter(c => c.commentId !== parts[3]);
        result = { message: 'Deleted' };
      } else if (method === 'DELETE' && parts[0] === 'discussions') {
        own(thread.uid);
        state.discussions = list.filter(t => t.id !== thread.id);
        result = { message: 'Deleted' };
      }
    }
  }
  if (result === undefined) throw new Error('This action is not available in the portfolio demo.');
  if (method !== 'GET') save(state);
  return result as T;
};
