import type { DictionaryEntry } from '@adp/data';
import { describe, expect, it } from 'vitest';
import { createIndex } from './index';

const entry = (
  id: string,
  headword: string,
  it: string,
  extra: Partial<DictionaryEntry> = {},
): DictionaryEntry => ({
  id,
  headword,
  senses: [{ it }],
  source: { letter: id[0] ?? 'a', url: 'https://example.test' },
  ...extra,
});

const entries = [
  entry('a-ardeca', 'ardeca', 'ortica', { variants: ['ardeche'] }),
  entry('a-abbada', 'abbadà', 'prestare attenzione a qualcuno o qualcosa', {
    senses: [{ it: 'prestare attenzione', en: 'to pay attention', enTranslateStatus: 'machine' }],
  }),
  entry('p-pecure', "pecure'", 'pecora', {
    examples: [{ abr: 'le pecure de lu pastore', it: 'le pecore del pastore', en: null }],
  }),
];

describe('createIndex', () => {
  const index = createIndex(entries);

  it('indexes every entry', () => {
    expect(index.size).toBe(3);
  });

  it('finds a headword in abr-it without diacritics', () => {
    expect(index.search('abbada', 'abr-it').map((r) => r.id)).toEqual(['a-abbada']);
  });

  it('matches by prefix and by variant', () => {
    expect(index.search('ard', 'abr-it').map((r) => r.id)).toEqual(['a-ardeca']);
    expect(index.search('ardeche', 'abr-it').map((r) => r.id)).toEqual(['a-ardeca']);
  });

  it('searches Italian glosses in it-abr but not headwords', () => {
    expect(index.search('ortica', 'it-abr').map((r) => r.id)).toEqual(['a-ardeca']);
    expect(index.search('ardeca', 'it-abr')).toEqual([]);
  });

  it('searches only English fields in en', () => {
    expect(index.search('attention', 'en').map((r) => r.id)).toEqual(['a-abbada']);
    expect(index.search('ortica', 'en')).toEqual([]);
  });

  it('folds apostrophes in index and query', () => {
    expect(index.search("pecure'", 'abr-it').map((r) => r.id)).toEqual(['p-pecure']);
    expect(index.search('pecure', 'any').map((r) => r.id)).toEqual(['p-pecure']);
  });

  it('tolerates a typo in longer terms', () => {
    expect(index.search('ortika', 'it-abr').map((r) => r.id)).toEqual(['a-ardeca']);
  });

  it('returns nothing for a blank query', () => {
    expect(index.search('   ')).toEqual([]);
  });
});
