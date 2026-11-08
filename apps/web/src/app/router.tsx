import { createBrowserRouter, createMemoryRouter } from 'react-router';
import { createRoutes, type RouteData } from './routes';

export { createRoutes } from './routes';

/** "/repo/" from Vite's base becomes "/repo" for the router. */
export function basenameFromBase(base: string): string {
  const trimmed = base.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** "/word/a-ardeca" under basename "/repo" becomes "/repo/word/a-ardeca". */
export function withBasename(basename: string, path: string): string {
  return basename === '/' ? path : `${basename}${path}`;
}

export const appBasename = (): string => basenameFromBase(import.meta.env.BASE_URL);

export function createAppRouter(data: RouteData = {}) {
  return createBrowserRouter(createRoutes(data), { basename: appBasename() });
}

/** Memory router for tests and server rendering; links carry `basename` like the browser's. */
export function createTestRouter(initialPath: string, data: RouteData = {}, basename = '/') {
  return createMemoryRouter(createRoutes(data), {
    basename,
    initialEntries: [withBasename(basename, initialPath)],
  });
}
