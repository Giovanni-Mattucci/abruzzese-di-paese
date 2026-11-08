import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';
import type { Dictionary } from '../data/dictionary';
import { BrowsePage } from '../pages/browse-page';
import { EntryPage } from '../pages/entry-page';
import { AboutPage, GrammarPage } from '../pages/lazy';
import { NotFoundPage } from '../pages/not-found-page';
import { SearchPage } from '../pages/search-page';
import { ErrorPage } from './error-page';
import { Layout } from './layout';

export interface RouteData {
  /** Pre-resolved data for server rendering and tests; the browser fetches when omitted. */
  dictionary?: Promise<Dictionary>;
  grammar?: Promise<string>;
  /** Real components instead of the lazy ones, so the route never suspends on a dynamic import. */
  eagerPages?: {
    GrammarPage?: ComponentType<{ promise?: Promise<string> }>;
    AboutPage?: ComponentType;
  };
}

export function createRoutes(data: RouteData = {}): RouteObject[] {
  const layoutProps = data.dictionary ? { dictionaryPromise: data.dictionary } : {};
  const grammarProps = data.grammar ? { promise: data.grammar } : {};
  const Grammar = data.eagerPages?.GrammarPage ?? GrammarPage;
  const About = data.eagerPages?.AboutPage ?? AboutPage;
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
        { path: 'grammar', element: <Grammar {...grammarProps} /> },
        { path: 'about', element: <About /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ];
}
