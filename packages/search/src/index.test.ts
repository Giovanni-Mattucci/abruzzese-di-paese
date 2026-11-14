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
  entry('a-allindietro', 'a partarrete', "all'indietro, all’improvviso", {
    senses: [{ it: "all'indietro, all’improvviso", en: "backwards; it's sudden" }],
  }),
  entry('a-capabballe', 'cap’abballe', 'sotto/giù (in basso)'),
  entry('c-c-i-arva', 'c-i-arvà', 'ci va di nuovo', { variants: ["c'arvà"] }),
  entry('p-pecure', "pecure'", 'pecora', {
    examples: [{ abr: 'le pecure de lu pastore', it: 'le pecore del pastore', en: null }],
  }),
];

describe('createIndex', () => {
  const index = createIndex(entries);

  it('indexes every entry', () => {
    expect(index.size).toBe(6);
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

  it('finds the word after an elided article, with either apostrophe', () => {
    expect(index.search('indietro', 'it-abr').map((r) => r.id)).toEqual(['a-allindietro']);
    expect(index.search('improvviso', 'it-abr').map((r) => r.id)).toEqual(['a-allindietro']);
    expect(index.search("all'indietro", 'it-abr').map((r) => r.id)).toEqual(['a-allindietro']);
    expect(index.search('allindietro', 'it-abr').map((r) => r.id)).toEqual(['a-allindietro']);
  });

  it('finds a dialect headword with or without its inner apostrophe', () => {
    for (const q of ["cap'abballe", 'capabballe', 'abballe']) {
      expect(index.search(q, 'abr-it').map((r) => r.id)).toEqual(['a-capabballe']);
    }
  });

  it('finds a hyphenated headword from its first letters, typed with or without hyphens', () => {
    for (const q of ['c', 'ci', 'c-i', 'cia', 'ciarva', 'c-i-arvà', 'arva', "c'arvà", 'carva']) {
      expect(
        index.search(q, 'abr-it').map((r) => r.id),
        q,
      ).toContain('c-c-i-arva');
    }
  });

  it('treats commas, slashes and brackets as separators in text and in queries', () => {
    expect(index.search('giù', 'it-abr').map((r) => r.id)).toEqual(['a-capabballe']);
    expect(index.search('basso', 'it-abr').map((r) => r.id)).toEqual(['a-capabballe']);
    expect(index.search('sotto, basso', 'it-abr').map((r) => r.id)).toEqual(['a-capabballe']);
    expect(index.search('(basso)', 'it-abr').map((r) => r.id)).toEqual(['a-capabballe']);
  });

  it('tolerates a typo in longer terms', () => {
    expect(index.search('ortika', 'it-abr').map((r) => r.id)).toEqual(['a-ardeca']);
  });

  it('returns nothing for a blank query', () => {
    expect(index.search('   ')).toEqual([]);
  });
});
