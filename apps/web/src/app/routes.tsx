import type { RouteObject } from 'react-router';
import type { Dictionary } from '../data/dictionary';
import { BrowsePage } from '../pages/browse-page/browse-page';
import { EntryPage } from '../pages/entry-page/entry-page';
import { NotFoundPage } from '../pages/not-found-page/not-found-page';
import { SearchPage } from '../pages/search-page/search-page';
import { ErrorPage } from '../pages/error-page/error-page';
import { Layout } from './layout';

export interface RouteData {
  /** Pre-resolved data for server rendering and tests; the browser fetches when omitted. */
  dictionary?: Promise<Dictionary>;
  grammar?: Promise<string>;
}

/**
 * The route table. A page with `lazy` is code-split, and this is the only place that says so: the
 * router loads it on navigation, and loadRoutes() loads it ahead of the first render.
 */
export function createRoutes(data: RouteData = {}): RouteObject[] {
  const layoutProps = data.dictionary ? { dictionaryPromise: data.dictionary } : {};
  const grammarProps = data.grammar ? { promise: data.grammar } : {};
  return [
    {
      path: '/',
      element: <Layout {...layoutProps} />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <SearchPage /> },
        { path: 'browse', element: <BrowsePage /> },
        { path: 'browse/:letter', element: <BrowsePage /> },
        { path: 'word/:id', element: <EntryPage /> },
        {
          path: 'grammar',
          lazy: async () => {
            const { GrammarPage } = await import('../pages/grammar-page/grammar-page');
            return { element: <GrammarPage {...grammarProps} /> };
          },
        },
        {
          path: 'about',
          lazy: async () => {
            const { AboutPage } = await import('../pages/about-page/about-page');
            return { Component: AboutPage };
          },
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ];
}
