import {
  createBrowserRouter,
  createMemoryRouter,
  matchRoutes,
  type RouteObject,
} from 'react-router';
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

/**
 * The routes, with the code-split page that `pathname` needs already loaded. The first render
 * (hydration in the browser, a prerendered page on the server) can then finish in one pass,
 * without a loading state. `pathname` includes the basename, like window.location.pathname.
 * Rejects when the page cannot be loaded: the prerender must fail, not write an empty page.
 */
export async function loadRoutes(
  pathname: string,
  data: RouteData = {},
  basename = appBasename(),
): Promise<RouteObject[]> {
  const routes = createRoutes(data);
  const matches = matchRoutes(routes, pathname, basename) ?? [];
  await Promise.all(
    matches.map(async ({ route }) => {
      if (typeof route.lazy === 'function') {
        Object.assign(route, await route.lazy(), { lazy: undefined });
      }
    }),
  );
  return routes;
}

export function createAppRouter(routes: RouteObject[]) {
  return createBrowserRouter(routes, { basename: appBasename() });
}

/** In-memory router for prerendering and tests; links carry `basename` like the browser's. */
export function createMemoryAppRouter(initialPath: string, routes: RouteObject[], basename = '/') {
  return createMemoryRouter(routes, {
    basename,
    initialEntries: [withBasename(basename, initialPath)],
  });
}
