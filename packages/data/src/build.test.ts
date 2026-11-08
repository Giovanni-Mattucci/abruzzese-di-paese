import { describe, expect, it } from 'vitest';
import { buildDictionary } from './build';
import type { Entry } from './types';

const entry = (id: string, letter: string): Entry => ({
  id,
  headword: id,
  senses: [{ it: 'x' }],
  contributors: ['someone'],
  source: {
    site: 'abruzzo.fm',
    letter,
    url: 'https://example.test',
    raw: 'r',
    rawHash: 'a'.repeat(40),
    scrapedAt: '2026-11-07',
  },
  schemaVersion: 1,
});

describe('buildDictionary', () => {
  it('sorts by id and strips provenance fields', () => {
    const out = buildDictionary([entry('b-x', 'b'), entry('a-x', 'a')]);
    expect(out.map((e) => e.id)).toEqual(['a-x', 'b-x']);
    expect(out[0]).not.toHaveProperty('schemaVersion');
    expect(out[0]).not.toHaveProperty('contributors');
    expect(out[0]?.source).toEqual({ letter: 'a', url: 'https://example.test' });
  });
});

describe('buildDictionary with source fragments', () => {
  it('appends the entry text fragment to its source URL, and leaves others unchanged', () => {
    const out = buildDictionary([entry('a-x', 'a'), entry('b-x', 'b')], {
      'a-x': { start: 'ardeca:' },
    });
    expect(out[0]?.source.url).toBe('https://example.test#:~:text=ardeca%3A');
    expect(out[1]?.source.url).toBe('https://example.test');
  });
});
