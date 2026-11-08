import type { DictionaryEntry } from '@adp/data';
import { describe, expect, it } from 'vitest';
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
  it('fetches once and caches', async () => {
    resetDictionaryCache();
    let calls = 0;
    const fetchImpl = (async () => {
      calls += 1;
      return new Response(JSON.stringify([entry('a-a', 'a', 'a')]), { status: 200 });
    }) as typeof fetch;
    const first = await loadDictionary(fetchImpl);
    const second = await loadDictionary(fetchImpl);
    expect(first).toBe(second);
    expect(calls).toBe(1);
    expect(first.entries).toHaveLength(1);
  });

  it('rejects on HTTP errors', async () => {
    resetDictionaryCache();
    const fetchImpl = (async () => new Response('', { status: 404 })) as typeof fetch;
    await expect(loadDictionary(fetchImpl)).rejects.toThrow('HTTP 404');
    resetDictionaryCache();
  });
});
