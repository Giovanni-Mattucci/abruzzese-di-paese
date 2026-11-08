import { describe, expect, it } from 'vitest';
import { formatEntry, loadEntryFiles, validateEntryFiles, type EntryFile } from './validate';
import type { Entry } from './types';
import { fileURLToPath } from 'node:url';

const ENTRIES_DIR = fileURLToPath(new URL('../entries', import.meta.url));

function sample(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'a-ardeca',
    headword: 'ardeca',
    senses: [{ it: 'ortica' }],
    source: {
      site: 'abruzzo.fm',
      letter: 'a',
      url: 'https://www.abruzzo.fm/archivio/treppecore/a.html',
      raw: 'ardeca, ardeche: ortica',
      rawHash: '0a7d7b8d4f6e5c3b2a1908f7e6d5c4b3a2918070',
      scrapedAt: '2026-11-07',
    },
    schemaVersion: 1,
    ...overrides,
  };
}

const file = (
  entry: Entry,
  path = `/root/entries/${entry.source.letter}/${entry.id}.json`,
): EntryFile => ({
  path,
  entry,
});

describe('validateEntryFiles', () => {
  it('accepts a valid entry', () => {
    expect(validateEntryFiles([file(sample())], '/root')).toEqual([]);
  });

  it('rejects unknown properties', () => {
    const bad = { ...sample(), extra: 1 } as unknown as Entry;
    const errors = validateEntryFiles([file(bad)], '/root');
    expect(errors[0]?.message).toContain('additional properties');
  });

  it('requires file name and directory to match id and letter', () => {
    const errors = validateEntryFiles([file(sample(), '/root/entries/b/wrong.json')], '/root');
    expect(errors.map((e) => e.message)).toEqual([
      expect.stringContaining('file name'),
      expect.stringContaining('directory'),
    ]);
  });

  it('requires a sense unless tagged needs-review', () => {
    expect(validateEntryFiles([file(sample({ senses: [] }))], '/root')).toHaveLength(1);
    expect(
      validateEntryFiles([file(sample({ senses: [], tags: ['needs-review'] }))], '/root'),
    ).toEqual([]);
  });

  it('rejects duplicate ids and raw hashes', () => {
    const a = sample();
    const b = sample({ headword: 'ardeche' });
    const errors = validateEntryFiles([file(a), file(b)], '/root');
    expect(errors.map((e) => e.message)).toEqual([
      expect.stringContaining('duplicate id'),
      expect.stringContaining('duplicate source.rawHash'),
    ]);
  });
});

describe('formatEntry', () => {
  it('orders keys canonically and ends with a newline', () => {
    const text = formatEntry({ ...sample(), variants: ['ardeche'] });
    expect(text.startsWith('{\n  "id": "a-ardeca",\n  "headword": "ardeca",\n  "variants"')).toBe(
      true,
    );
    expect(text.endsWith('}\n')).toBe(true);
  });
});

describe('committed entries', () => {
  it('all pass validation', () => {
    const files = loadEntryFiles(ENTRIES_DIR);
    expect(files.length).toBeGreaterThan(0);
    expect(validateEntryFiles(files, ENTRIES_DIR)).toEqual([]);
  });
});
