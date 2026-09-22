export const posterUrl = (path: string) => path.startsWith('/demo-posters/')
  ? `${process.env.PUBLIC_URL || ''}${path}`
  : path ? `https://image.tmdb.org/t/p/w500${path}` : `${process.env.PUBLIC_URL || ''}/demo-posters/1001.svg`;
