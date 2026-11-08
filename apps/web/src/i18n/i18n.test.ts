import { describe, expect, it } from 'vitest';
import { applyLocale, createI18n, detectLocale, isLocale } from './index';
import en from './locales/en/common.json';
import itStrings from './locales/it/common.json';

function keysOf(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object'
      ? keysOf(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}

describe('locale resources', () => {
  it('have the same keys in English and Italian', () => {
    expect(keysOf(itStrings).sort()).toEqual(keysOf(en).sort());
  });

  it('keep the same interpolation placeholders per key', () => {
    const placeholders = (s: unknown) =>
      [...String(s).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();
    const flat = (o: Record<string, unknown>, p = ''): [string, unknown][] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === 'object'
          ? flat(v as Record<string, unknown>, `${p}${k}.`)
          : [[`${p}${k}`, v]],
      );
    const itMap = new Map(flat(itStrings));
    for (const [key, value] of flat(en)) {
      expect(placeholders(itMap.get(key)), key).toEqual(placeholders(value));
    }
  });
});

describe('detectLocale', () => {
  it('falls back to English', () => {
    expect(detectLocale(null)).toBe('en');
    expect(detectLocale({ getItem: () => 'de' })).toBe('en');
  });
  it('honours a stored choice over the browser language', () => {
    expect(detectLocale({ getItem: () => 'it' })).toBe('it');
    expect(detectLocale({ getItem: () => 'en' }, 'it-IT')).toBe('en');
  });
  it('falls back to the browser language when it is supported', () => {
    expect(detectLocale(null, 'it-IT')).toBe('it');
    expect(detectLocale(null, 'de-DE')).toBe('en');
  });
  it('isLocale guards unknown values', () => {
    expect(isLocale('it')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });
});

describe('createI18n and applyLocale', () => {
  it('translates with plurals and interpolation', () => {
    const i18n = createI18n('en');
    expect(i18n.t('search.results_count', { count: 1 })).toBe('1 result');
    expect(i18n.t('search.results_count', { count: 3 })).toBe('3 results');
  });
  it('switches language, persists it and updates the html lang', () => {
    const i18n = createI18n('en');
    const store = new Map<string, string>();
    applyLocale(i18n, 'it', { setItem: (k, v) => store.set(k, v) });
    expect(i18n.t('nav.search')).toBe('Cerca');
    expect(store.get('locale')).toBe('it');
    expect(document.documentElement.lang).toBe('it');
  });
});
