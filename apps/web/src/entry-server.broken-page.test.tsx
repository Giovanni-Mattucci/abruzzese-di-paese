import { expect, it, vi } from 'vitest';
import { prepare, renderPath } from './entry-server';
import { sampleEntries } from './test/sample';

vi.mock('./pages/grammar-page/grammar-page', () => {
  throw new Error('grammar page failed to load');
});

it('fails the prerender when a code-split page cannot be loaded, instead of writing an empty page', async () => {
  const data = prepare(sampleEntries, '<p>grammar</p>');
  await expect(renderPath('/grammar', data, '/')).rejects.toThrow();
  // Other pages are unaffected.
  expect(await renderPath('/about', data, '/')).toContain('<h1');
});
