import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { API_BASE_URL } from '../config';
import { auth, db } from './firebase';

export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;
  details?: unknown;

  constructor(message: string, status: number, options: { code?: string; requestId?: string; details?: unknown } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.details = options.details;
  }
}

type ApiErrorBody = {
  error?: string | { code?: string; message?: string; requestId?: string };
  details?: unknown;
  message?: string;
};

const readResponse = async <T,>(response: Response): Promise<T> => {
  const body = await response.json().catch(() => ({})) as ApiErrorBody;
  if (response.ok) return body as T;

  const structured = typeof body.error === 'object' ? body.error : undefined;
  const message = structured?.message
    || (typeof body.error === 'string' ? body.error : undefined)
    || body.message
    || `Request failed with status ${response.status}`;

  throw new ApiError(message, response.status, {
    code: structured?.code,
    requestId: structured?.requestId || response.headers.get('x-request-id') || undefined,
    details: body.details,
  });
};

const request = async <T,>(path: string, options: RequestInit = {}, authenticated = false): Promise<T> => {
  const token = authenticated ? await auth.currentUser?.getIdToken() : null;
  if (authenticated && !token) {
    throw new ApiError('Please sign in to continue.', 401, { code: 'authentication_required' });
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return readResponse<T>(response);
};

export const authFetch = async (
  path: string,
  options: RequestInit = {},
  getToken: () => Promise<string | null> = () => auth.currentUser?.getIdToken() ?? Promise.resolve(null)
): Promise<Response> => {
  const token = await getToken();
  if (!token) throw new ApiError('Please sign in to continue.', 401, { code: 'authentication_required' });
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    return error.requestId ? `${error.message} (request ${error.requestId})` : error.message;
  }
  return error instanceof Error && error.message ? error.message : fallback;
};

export interface UserProfile {
  Username: string;
  username: string;
  Joined: string;
  Last_online: string;
  movie_list?: Array<number | string>;
  reviews: string[];
  Completed: Array<number | string>;
  Dropped: Array<number | string>;
  On_hold: Array<number | string>;
  Plan_to_watch: Array<number | string>;
  Rewatched: Array<number | string>;
}

export const WATCH_STATUSES = ['Completed', 'Dropped', 'On_hold', 'Plan_to_watch', 'Rewatched'] as const;
export type WatchStatus = typeof WATCH_STATUSES[number];

export interface WatchEntry {
  id: string;
  userId?: string;
  movieId: string;
  status: WatchStatus;
  watchedAt?: string;
  rating?: number;
  progress?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WatchEntryInput {
  status: WatchStatus;
  watchedAt?: string;
  rating?: number;
  progress?: number;
  notes?: string;
}

export interface AppReview {
  id: string;
  movieId: number;
  Author: string;
  content: string;
  rating: number;
  uid?: string;
  date: string;
}

export interface AppComment {
  commentId: string;
  author: string;
  content: string;
  date: string;
  uid?: string;
}

export interface AppThread {
  id: string;
  uid?: string;
  Author: string;
  Date: string;
  Title: string;
  Description: string;
  Comments: AppComment[];
}

export type ReportTargetType = 'review' | 'thread' | 'comment';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterUid: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolution: string | null;
}

export interface ResolveReportInput {
  status: 'resolved' | 'dismissed';
  removeTarget?: boolean;
}

// Report a piece of content (auth). The reporter is always the token uid; the
// server rejects a second open report on the same target with a 409.
export const reportContent = (targetType: ReportTargetType, targetId: string, reason: string) =>
  request<Report>('/reports', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, reason }),
  }, true);

// Moderator/admin only: list reports for a status (defaults to open, newest-first).
export const getReports = (status: ReportStatus = 'open') =>
  request<{ status: ReportStatus; reports: Report[] }>(
    `/reports?status=${encodeURIComponent(status)}`,
    {},
    true
  );

// Moderator/admin only: resolve or dismiss a report, optionally removing the
// offending content. Returns the updated report plus whether it was removed.
export const resolveReport = (id: string, input: ResolveReportInput) =>
  request<Report & { removedTarget: boolean }>(
    `/reports/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify(input) },
    true
  );

const DEFAULT_PROFILE = (username: string, timestamp: string): UserProfile => ({
  Username: username,
  username,
  Joined: timestamp,
  Last_online: timestamp,
  movie_list: [],
  reviews: [],
  Completed: [],
  Dropped: [],
  On_hold: [],
  Plan_to_watch: [],
  Rewatched: [],
});

const sortByDateDesc = <T extends { Date?: string; date?: string }>(items: T[]) =>
  [...items].sort((a, b) => {
    const left = new Date(a.Date || a.date || 0).getTime();
    const right = new Date(b.Date || b.date || 0).getTime();
    return right - left;
  });

export const createUserProfile = async (_uid: string, email?: string | null) => {
  const timestamp = new Date().toISOString();
  const profile = DEFAULT_PROFILE(email?.split('@')[0] || 'Anonymous', timestamp);
  await request<{ message: string; uid: string }>('/profile/create', {
    method: 'POST',
    body: JSON.stringify(profile),
  }, true);
  return profile;
};

export const ensureUserProfile = async (uid: string, email?: string | null) => {
  try {
    return await getUserProfile(uid);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404 && auth.currentUser?.uid === uid) {
      return createUserProfile(uid, email);
    }
    throw error;
  }
};

export const getUserProfile = (uid: string) =>
  request<UserProfile>(`/profile/data/${encodeURIComponent(uid)}`);

export const updateLastOnline = async (_uid?: string) => {
  await request<{ message: string }>('/profile/update/last_online', {
    method: 'PUT',
    body: JSON.stringify({ last_online: new Date().toISOString() }),
  }, true);
};

export const getWatchEntries = (uid: string) =>
  request<WatchEntry[]>(`/profile/watch_entries/${encodeURIComponent(uid)}`);

export const saveWatchEntry = async (_uid: string, movieId: number, input: WatchEntryInput) => {
  const { entry } = await request<{ message: string; entry: WatchEntry }>(
    `/profile/update/${input.status}/add_movie`,
    { method: 'PUT', body: JSON.stringify({ movieId, ...input }) },
    true
  );
  return entry;
};

export const removeWatchEntry = async (_uid: string, movieId: number, status: WatchStatus) => {
  await request<{ message: string }>(`/profile/update/${status}/remove_movie`, {
    method: 'PUT',
    body: JSON.stringify({ movieId }),
  }, true);
};

export const addMovieToUserList = (_uid: string, movieId: number) =>
  saveWatchEntry(_uid, movieId, { status: 'Plan_to_watch' });

export const removeMovieFromUserList = async (uid: string, movieId: number) => {
  const entry = (await getWatchEntries(uid)).find((item) => String(item.movieId) === String(movieId));
  if (entry) await removeWatchEntry(uid, movieId, entry.status);
};

export const setMovieStatus = (_uid: string, movieId: number, status: string) => {
  if (!WATCH_STATUSES.includes(status as WatchStatus)) {
    throw new ApiError('That watch status is not supported by the server.', 400, { code: 'invalid_status' });
  }
  return saveWatchEntry(_uid, movieId, { status: status as WatchStatus });
};

export const createReview = async (payload: Omit<AppReview, 'id' | 'date'>) => {
  const result = await request<{ id: string; review: Omit<AppReview, 'id' | 'uid'> }>('/reviews/posting', {
    method: 'POST',
    body: JSON.stringify({
      movieId: payload.movieId,
      Author: payload.Author,
      content: payload.content,
      rating: payload.rating,
    }),
  }, true);

  await request<{ message: string }>('/profile/update/add_review', {
    method: 'PUT',
    body: JSON.stringify({ reviewId: result.id }),
  }, true);
  return { id: result.id, ...result.review, uid: auth.currentUser?.uid } as AppReview;
};

const reviewsCollection = collection(db, 'Reviews');

export const getReviewsForMovie = async (movieId: number) => {
  const snapshot = await getDocs(query(reviewsCollection, where('movieId', '==', movieId)));
  return sortByDateDesc(snapshot.docs.map((reviewDoc) => ({
    id: reviewDoc.id,
    ...(reviewDoc.data() as Omit<AppReview, 'id'>),
  })));
};

export const getReviewById = async (reviewId: string) => {
  const snapshot = await getDoc(doc(db, 'Reviews', reviewId));
  if (!snapshot.exists()) throw new ApiError('Review not found', 404, { code: 'not_found' });
  return { id: snapshot.id, ...(snapshot.data() as Omit<AppReview, 'id'>) };
};

export const getReviewsForUser = async (uid: string) => {
  const profile = await getUserProfile(uid);
  const reviews = await Promise.all((profile.reviews || []).map((id) => getReviewById(id).catch(() => null)));
  return sortByDateDesc(reviews.filter(Boolean) as AppReview[]);
};

export const deleteReviewForUser = async (reviewId: string, _uid?: string) => {
  await request<{ message: string }>(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE' }, true);
  await request<{ message: string }>('/profile/update/remove_review', {
    method: 'PUT',
    body: JSON.stringify({ reviewId }),
  }, true);
};

export const updateReview = async (reviewId: string, update: { content: string; rating: number }) => {
  await request<{ message: string }>(`/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  }, true);
};

const routeFor = (name: 'Discussions' | 'News') => name === 'Discussions' ? 'discussions' : 'news';

export const getThreads = async (name: 'Discussions' | 'News') => {
  const threads = await request<AppThread[]>(`/${routeFor(name)}/posts`);
  return sortByDateDesc(threads);
};

export const createThread = async (name: 'Discussions' | 'News', payload: Omit<AppThread, 'id'>) => {
  const result = await request<{ id: string }>(`/${routeFor(name)}/posting`, {
    method: 'POST',
    body: JSON.stringify({
      Author: payload.Author,
      Date: payload.Date,
      Title: payload.Title,
      Description: payload.Description,
    }),
  }, true);
  return { id: result.id, ...payload };
};

export const getThreadById = (name: 'Discussions' | 'News', id: string) =>
  request<AppThread>(`/${routeFor(name)}/post/${encodeURIComponent(id)}`);

export const deleteThread = async (_name: 'Discussions' | 'News', id: string, _uid?: string) => {
  await request<{ message: string }>(`/discussions/post/${encodeURIComponent(id)}`, { method: 'DELETE' }, true);
};

export const addCommentToThread = async (
  name: 'Discussions' | 'News',
  id: string,
  comment: AppComment
) => {
  const result = await request<{ comment: AppComment }>(
    `/${routeFor(name)}/post/${encodeURIComponent(id)}/comment`,
    {
      method: 'POST',
      body: JSON.stringify({ author: comment.author, content: comment.content, date: comment.date }),
    },
    true
  );
  return { ...result.comment, uid: auth.currentUser?.uid };
};

export const deleteCommentFromThread = async (
  name: 'Discussions' | 'News',
  id: string,
  commentId: string,
  _uid?: string
) => {
  if (name === 'News') {
    throw new ApiError('The server does not support deleting news comments yet.', 405, { code: 'method_not_supported' });
  }
  await request<{ message: string }>(
    `/discussions/comment/${encodeURIComponent(id)}/${encodeURIComponent(commentId)}`,
    { method: 'DELETE' },
    true
  );
};
