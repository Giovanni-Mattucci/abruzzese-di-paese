import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { appBasename, createAppRouter } from './app/router';
import type { RouteData } from './app/routes';
import { loadDictionary } from './data/dictionary';
import { loadGrammar } from './data/grammar';
import { fulfilled } from './data/thenable';
import { isFlagEnabled } from './flags/flags';
import { createI18n, DEFAULT_LOCALE, detectLocale } from './i18n';
import './index.css';

const locale = detectLocale(window.localStorage, navigator.language);
createI18n(locale);
document.documentElement.lang = locale;
if (isFlagEnabled('DESIGN_V2')) document.documentElement.setAttribute('data-theme', 'v2');

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');
const container: HTMLElement = root;

function app(data: RouteData = {}) {
  return (
    <StrictMode>
      <RouterProvider router={createAppRouter(data)} />
    </StrictMode>
  );
}

/** Path below the site's base path, e.g. "/grammar". */
function routePath(): string {
  const basename = appBasename();
  const path = window.location.pathname;
  return basename !== '/' && path.startsWith(basename) ? path.slice(basename.length) : path;
}

/**
 * Loads everything the current page needs before the first render, so the prerendered markup
 * stays on screen until the real page can replace it in one step (no loading message between).
 * On a failed fetch the data is left out and the page's own error handling takes over.
 */
async function preload(): Promise<RouteData> {
  const path = routePath().replace(/\/+$/, '');
  const [dictionary, grammar, grammarPage, aboutPage] = await Promise.all([
    loadDictionary().catch(() => undefined),
    path === '/grammar' ? loadGrammar().catch(() => undefined) : undefined,
    path === '/grammar' ? import('./pages/grammar-page/grammar-page') : undefined,
    path === '/about' ? import('./pages/about-page/about-page') : undefined,
  ]);
  return {
    ...(dictionary ? { dictionary: fulfilled(dictionary) } : {}),
    ...(grammar !== undefined ? { grammar: fulfilled(grammar) } : {}),
    eagerPages: {
      ...(grammarPage ? { GrammarPage: grammarPage.GrammarPage } : {}),
      ...(aboutPage ? { AboutPage: aboutPage.AboutPage } : {}),
    },
  };
}

async function start(): Promise<void> {
  // Pages are prerendered in English with no query string. Hydrate only when the markup will
  // match; otherwise (Italian, ?q=, ?page=) render fresh so there is never a hydration mismatch.
  const prerendered = container.hasChildNodes();
  const matchesPrerender = locale === DEFAULT_LOCALE && window.location.search === '';
  if (prerendered && matchesPrerender) {
    hydrateRoot(container, app());
    return;
  }
  const data = prerendered ? await preload() : {};
  container.replaceChildren();
  createRoot(container).render(app(data));
}

void start();
