import { lazy } from 'react';

/** Secondary pages are code-split; the layout's Suspense boundary shows the loading state. */
export const GrammarPage = lazy(() =>
  import('./grammar-page').then((m) => ({ default: m.GrammarPage })),
);
export const AboutPage = lazy(() => import('./about-page').then((m) => ({ default: m.AboutPage })));
