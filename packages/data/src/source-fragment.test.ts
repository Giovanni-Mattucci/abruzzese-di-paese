import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { type SourceFragment, withTextFragment } from './source-fragment';
import { loadEntryFiles } from './validate';

const PAGE = 'https://www.abruzzo.fm/archivio/treppecore/c.html';

describe('withTextFragment', () => {
  it('leaves the URL unchanged without a fragment', () => {
    expect(withTextFragment(PAGE)).toBe(PAGE);
  });

  it('percent-encodes the text, including the reserved "-", "," and "&"', () => {
    expect(withTextFragment(PAGE, { start: 'cuppène, a-b & c' })).toBe(
      `${PAGE}#:~:text=cupp%C3%A8ne%2C%20a%2Db%20%26%20c`,
    );
  });

  it('puts a prefix before the start, separated by "-,"', () => {
    expect(withTextFragment(PAGE, { prefix: 'ortica', start: 'ardeche: ortica' })).toBe(
      `${PAGE}#:~:text=ortica-,ardeche%3A%20ortica`,
    );
  });
});

describe('source-fragments.json', () => {
  const { fragments } = JSON.parse(
    readFileSync(new URL('../source-fragments.json', import.meta.url), 'utf8'),
  ) as { fragments: Record<string, SourceFragment> };
  const files = loadEntryFiles(fileURLToPath(new URL('../entries', import.meta.url)));
  // The pages mix straight and curly apostrophes; the entries store straight ones.
  const fold = (s: string) => s.replace(/[‘’]/g, "'").replace(/\s+/g, ' ').toLowerCase();

  it('points every entry at text from its own source line', () => {
    const wrong = files
      .map((f) => f.entry)
      .filter((e) => {
        const fragment = fragments[e.id];
        return !fragment || !fold(e.source.raw).includes(fold(fragment.start).replace(/^'+/, ''));
      })
      .map((e) => e.id);
    expect(wrong).toEqual([]);
  });
});
