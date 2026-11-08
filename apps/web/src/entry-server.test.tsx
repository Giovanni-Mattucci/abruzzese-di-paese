import { describe, expect, it } from 'vitest';
import { prepare, renderPath } from './entry-server';
import { sampleEntries } from './test/sample';

function internalHrefs(html: string): string[] {
  return [...html.matchAll(/href="([^"]*)"/g)]
    .map((m) => m[1] ?? '')
    .filter((href) => href.startsWith('/'));
}

describe('renderPath', () => {
  const data = prepare(sampleEntries, '<p>grammar</p>');

  it.each(['/', '/browse/a', '/word/a-ardeca', '/grammar', '/about'])(
    'prefixes every internal link on %s with the base path',
    (path) => {
      const hrefs = internalHrefs(renderPath(path, data, '/abruzzese-di-paese'));
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) expect(href).toMatch(/^\/abruzzese-di-paese(\/|$)/);
    },
  );

  it('renders the requested page under the base path', () => {
    const html = renderPath('/word/a-ardeca', data, '/abruzzese-di-paese');
    expect(html).toContain('ardeca');
    expect(html).toContain('href="/abruzzese-di-paese/browse/a"');
  });

  it('leaves links unprefixed at the domain root', () => {
    expect(internalHrefs(renderPath('/word/a-ardeca', data, '/'))).toContain('/browse/a');
  });
});
