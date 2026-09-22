export const posterUrl = (path: string) => path
  ? `https://image.tmdb.org/t/p/w500${path}`
  : `${process.env.PUBLIC_URL || ''}/poster-unavailable.svg`;
