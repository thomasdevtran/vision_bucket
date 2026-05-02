// Shared TypeScript interfaces for Vision Bucket

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

export interface Review {
  id: string;
  movieId: number;
  Author: string;
  content: string;
  rating: number;
  uid: string;
  date: string;
}

export interface Thread {
  id: string;
  uid: string;
  title: string;
  description: string;
  date: string;
  author: string;
}

export interface Comment {
  commentId: string;
  content: string;
  author: string;
  date: string;
  uid: string;
}

export interface UserProfile {
  username: string;
  Joined: string;
  Last_online: string;
  movie_list: number[];
  reviews: string[];
  Watching: number[];
  Completed: number[];
  On_hold: number[];
  Dropped: number[];
  Plan_to_watch: number[];
  Rewatched: number[];
}

export type WatchStatus = 'Watching' | 'Completed' | 'On_hold' | 'Dropped' | 'Plan_to_watch';
