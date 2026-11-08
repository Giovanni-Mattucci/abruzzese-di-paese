import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { RouterProvider } from 'react-router/dom';
import { createTestRouter } from '../app/router';
import type { RouteData } from '../app/routes';
import { createI18n } from '../i18n';

export { sampleEntries } from './sample';

/** Renders the real routes at `path` with English strings. Mock loadDictionary in the test file. */
export function renderApp(path: string, data: RouteData = {}) {
  const i18n = createI18n('en');
  const router = createTestRouter(path, data);
  const view = render(
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
  return { ...view, router, i18n };
}
