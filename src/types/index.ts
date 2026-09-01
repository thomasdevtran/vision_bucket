export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

export interface MovieSearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenreListResponse {
  genres: Genre[];
}

export interface AppReview {
  id: string;
  movieId: number;
  Author: string;
  content: string;
  rating: number;
  uid: string;
  date: string;
}

export interface AppComment {
  commentId: string;
  author: string;
  content: string;
  date: string;
  uid: string;
}

export interface AppThread {
  id: string;
  uid: string;
  Author: string;
  Date: string;
  Title: string;
  Description: string;
  Comments: AppComment[];
}

export interface UserProfile {
  Username: string;
  username: string;
  Joined: string;
  Last_online: string;
  movie_list: number[];
  reviews: string[];
  Completed: number[];
  Dropped: number[];
  On_hold: number[];
  Plan_to_watch: number[];
  Watching: number[];
  Rewatched: number[];
}

export type MovieStatus =
  | 'Watching'
  | 'Completed'
  | 'On_hold'
  | 'Dropped'
  | 'Plan_to_watch'
  | 'Rewatched';
