import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import type { RouteObject } from 'react-router';
import { createAppRouter, loadRoutes } from './app/router';
import type { RouteData } from './app/routes';
import { loadDictionary } from './data/dictionary';
import { loadGrammar } from './data/grammar';
import { fulfilled } from './data/thenable';
import { isFlagEnabled } from './flags/flags';
import { createI18n, DEFAULT_LOCALE, detectLocale } from './i18n';
import { safeLocalStorage } from './storage';
import './index.css';

const locale = detectLocale(safeLocalStorage(), navigator.language);
createI18n(locale);
document.documentElement.lang = locale;
if (isFlagEnabled('DESIGN_V2')) document.documentElement.setAttribute('data-theme', 'v2');

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');
const container: HTMLElement = root;

function app(routes: RouteObject[]) {
  return (
    <StrictMode>
      <RouterProvider router={createAppRouter(routes)} />
    </StrictMode>
  );
}

/**
 * Fetches the data the current page needs before the first render, so the prerendered markup
 * stays on screen until the real page can replace it in one step (no loading message between).
 * On a failed fetch the data is left out and the page's own error handling takes over.
 */
async function preload(): Promise<RouteData> {
  const onGrammar = /\/grammar\/?$/.test(window.location.pathname);
  const [dictionary, grammar] = await Promise.all([
    loadDictionary().catch(() => undefined),
    onGrammar ? loadGrammar().catch(() => undefined) : undefined,
  ]);
  return {
    ...(dictionary ? { dictionary: fulfilled(dictionary) } : {}),
    ...(grammar !== undefined ? { grammar: fulfilled(grammar) } : {}),
  };
}

async function start(): Promise<void> {
  // Pages are prerendered in English with no query string. Hydrate only when the markup will
  // match; otherwise (Italian, ?q=, ?page=) render fresh so there is never a hydration mismatch.
  const prerendered = container.hasChildNodes();
  const hydrate = prerendered && locale === DEFAULT_LOCALE && window.location.search === '';
  const data = prerendered && !hydrate ? await preload() : {};
  // The code-split page for this URL is loaded first, so neither path shows a loading state.
  const routes = await loadRoutes(window.location.pathname, data);
  if (hydrate) {
    hydrateRoot(container, app(routes));
    return;
  }
  container.replaceChildren();
  createRoot(container).render(app(routes));
}

void start();
