import { describe, expect, it } from 'vitest';
import { fold, normaliseApostrophes, slugify, uniqueSlug } from './text';

describe('fold', () => {
  it('lowercases and strips diacritics', () => {
    expect(fold('Abbadà')).toBe('abbada');
    expect(fold('jù')).toBe('ju');
  });

  it('drops apostrophes of any shape', () => {
    expect(fold("pe'")).toBe('pe');
    expect(fold('pe’')).toBe('pe');
  });

  it('maps schwa-like letters to e', () => {
    expect(fold('pəcurə')).toBe('pecure');
    expect(fold('fëmmenë')).toBe('femmene');
  });
});

describe('normaliseApostrophes', () => {
  it('keeps the text otherwise intact', () => {
    expect(normaliseApostrophes('l’addoro')).toBe("l'addoro");
  });
});

describe('slugify', () => {
  it('prefixes the letter and hyphenates', () => {
    expect(slugify('a', 'a capaballe')).toBe('a-a-capaballe');
    expect(slugify('A', "'ncacchiate")).toBe('a-ncacchiate');
  });

  it('falls back when nothing survives folding', () => {
    expect(slugify('s', "''")).toBe('s-entry');
  });
});

describe('uniqueSlug', () => {
  it('appends a counter on collision', () => {
    const taken = new Set(['a-x', 'a-x-2']);
    expect(uniqueSlug('a-x', taken)).toBe('a-x-3');
    expect(uniqueSlug('a-y', taken)).toBe('a-y');
  });
});
