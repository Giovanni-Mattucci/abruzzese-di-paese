import type { DictionaryEntry, Entry } from './types';

/** Strip provenance-only fields so the browser payload stays small. */
export function toDictionaryEntry(entry: Entry): DictionaryEntry {
  const { source, schemaVersion: _v, contributors: _c, ...rest } = entry;
  return { ...rest, source: { letter: source.letter, url: source.url } };
}

export function buildDictionary(entries: Entry[]): DictionaryEntry[] {
  return [...entries].sort((a, b) => a.id.localeCompare(b.id)).map(toDictionaryEntry);
}
