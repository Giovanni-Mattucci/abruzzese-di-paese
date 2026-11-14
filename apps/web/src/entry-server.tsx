// Server entry used by postbuild/prerender.ts. Renders one route to static HTML.
import type { DictionaryEntry } from '@adp/data';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { RouterProvider } from 'react-router';
import { appBasename, createMemoryAppRouter, loadRoutes, withBasename } from './app/router';
import { buildDictionary, type Dictionary } from './data/dictionary';
import { fulfilled } from './data/thenable';
import { createI18n } from './i18n';

export interface ServerData {
  dictionary: Promise<Dictionary>;
  grammar: Promise<string>;
}

export function prepare(entries: DictionaryEntry[], grammarHtml: string): ServerData {
  return { dictionary: fulfilled(buildDictionary(entries)), grammar: fulfilled(grammarHtml) };
}

/**
 * Renders `path` (e.g. "/word/a-ardeca") in English and returns the HTML for #root. The router
 * gets the same basename as the browser, so every prerendered href includes the site's base path.
 */
export async function renderPath(
  path: string,
  data: ServerData,
  basename = appBasename(),
): Promise<string> {
  const i18n = createI18n('en');
  const routes = await loadRoutes(withBasename(basename, path), data, basename);
  return renderToString(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={createMemoryAppRouter(path, routes, basename)} />
      </I18nextProvider>
    </StrictMode>,
  );
}
