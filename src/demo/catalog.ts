import { Movie, MovieSearchResponse } from '../types';

export const demoGenres = [{ id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 878, name: 'Science Fiction' }];
const titles = [
  ['Midnight Relay', 'A bicycle courier has one night to deliver a mysterious film reel across a city that has lost power.', 28],
  ['Orbit Seven', 'A repair crew on an abandoned station intercepts a signal from a ship that vanished decades ago.', 28, 878],
  ['The Last Crossing', 'Two estranged siblings must guide a rescue convoy through a mountain pass before the first winter storm.', 28],
  ['Neon Current', 'A ferry captain and a street artist uncover a plan to erase their city’s waterfront neighborhood.', 28],
  ['Red Horizon', 'A weather scientist races across a desert to recover the last working transmitter before a solar storm.', 28, 878],
  ['Signal Lost', 'An amateur radio operator follows a distress call into a forest where every compass points the wrong way.', 28, 878],
  ['The Plus One', 'Two strangers agree to be each other’s guests for a summer of weddings, with increasingly elaborate cover stories.', 35],
  ['Small Town, Big Stage', 'A reluctant accountant inherits a community theater and accidentally books its biggest show ever.', 35],
  ['Sunday Special', 'Three cousins try to keep their grandmother’s diner running for one chaotic weekend.', 35],
  ['Out of Office', 'A meticulous project manager gets stranded on a team retreat with the coworkers who ignore every itinerary.', 35],
  ['A Very Minor Heist', 'Retired neighbors hatch an overly complicated plan to retrieve a beloved garden statue.', 35],
  ['Second Take', 'A washed-up magician and a first-time filmmaker join forces to make a movie with no budget and too many pigeons.', 35],
] as const;

// Original fictional titles and locally bundled artwork: no API keys or remote image dependency.
export const demoMovies = titles.map((entry, index) => ({
  id: 1001 + index, title: entry[0], overview: entry[1], genre_ids: entry.slice(2) as number[],
  poster_path: `/demo-posters/${1001 + index}.svg`, release_date: `2025-${String(index + 1).padStart(2, '0')}-14`,
  vote_average: Number((7.1 + (index % 5) * 0.3).toFixed(1)),
}));

export const demoPage = (movies: Movie[], page = 1): MovieSearchResponse => ({
  page, results: movies.slice((page - 1) * 20, page * 20), total_pages: Math.ceil(movies.length / 20), total_results: movies.length,
});

export const demoMovie = (id: number): Movie => {
  const movie = demoMovies.find(item => item.id === id);
  if (!movie) throw new Error('Movie not found in the demo catalog.');
  return movie;
};
