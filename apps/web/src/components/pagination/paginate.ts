export interface PageOf<T> {
  /** Current page, 1-based and always a whole number within range. */
  page: number;
  /** Total pages, at least 1. */
  pages: number;
  items: T[];
}

/**
 * Cuts one page out of a list. `rawPage` is the ?page= value from the URL, so anything can
 * arrive: a missing, fractional, negative or too-large value still lands on a real page.
 */
export function paginate<T>(all: readonly T[], rawPage: string | null, size: number): PageOf<T> {
  const pages = Math.max(1, Math.ceil(all.length / size));
  const page = Math.min(pages, Math.max(1, Math.round(Number(rawPage)) || 1));
  return { page, pages, items: all.slice((page - 1) * size, page * size) };
}
