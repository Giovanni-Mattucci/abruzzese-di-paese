import { expect, it, vi } from 'vitest';
import { prepare, renderPath } from './entry-server';
import { sampleEntries } from './test/sample';

vi.mock('./pages/grammar-page/grammar-page', () => {
  throw new Error('grammar page failed to load');
});

it('fails the prerender when a code-split page cannot be loaded, instead of writing an empty page', async () => {
  const data = prepare(sampleEntries, '<p>grammar</p>');
  // Vitest wraps an error thrown by a module mock; the page's own error is its cause.
  await expect(renderPath('/grammar', data, '/')).rejects.toHaveProperty(
    'cause.message',
    'grammar page failed to load',
  );
  // Other pages are unaffected.
  expect(await renderPath('/about', data, '/')).toContain('<h1');
});
