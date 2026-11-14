import type { DictionaryEntry } from '@adp/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildDictionary, loadDictionary, resetDictionaryCache } from './dictionary';

const entry = (id: string, headword: string, letter: string): DictionaryEntry => ({
  id,
  headword,
  senses: [{ it: 'x' }],
  source: { letter, url: 'https://example.test' },
});

describe('buildDictionary', () => {
  it('groups by letter, sorts headwords ignoring accents, and indexes', () => {
    const d = buildDictionary([
      entry('s-zz', 'zù', 's'),
      entry('a-b', 'àbbete', 'a'),
      entry('a-a', 'abbà', 'a'),
    ]);
    expect(d.letters).toEqual(['a', 's']);
    expect(d.byLetter.get('a')?.map((e) => e.headword)).toEqual(['abbà', 'àbbete']);
    expect(d.byId.get('s-zz')?.headword).toBe('zù');
    expect(d.index.search('abba', 'abr-it').map((r) => r.id)).toEqual(['a-a']);
  });
});

describe('loadDictionary', () => {
  afterEach(() => {
    resetDictionaryCache();
    vi.unstubAllGlobals();
  });

  it('fetches once and caches', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify([entry('a-a', 'a', 'a')]), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const first = await loadDictionary();
    const second = await loadDictionary();
    expect(first).toBe(second);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first.entries).toHaveLength(1);
  });

  it('rejects on HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 404 })),
    );
    await expect(loadDictionary()).rejects.toThrow('HTTP 404');
  });
});
