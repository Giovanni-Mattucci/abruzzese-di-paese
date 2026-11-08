import type { DictionaryEntry } from '@adp/data';
import { createIndex, type DictionaryIndex } from '@adp/search';

export interface Dictionary {
  entries: DictionaryEntry[];
  byId: ReadonlyMap<string, DictionaryEntry>;
  byLetter: ReadonlyMap<string, DictionaryEntry[]>;
  letters: string[];
  index: DictionaryIndex;
}

const collator = new Intl.Collator('it', { sensitivity: 'base' });

export function buildDictionary(entries: DictionaryEntry[]): Dictionary {
  const byId = new Map<string, DictionaryEntry>();
  const byLetter = new Map<string, DictionaryEntry[]>();
  for (const entry of entries) {
    byId.set(entry.id, entry);
    const list = byLetter.get(entry.source.letter) ?? [];
    list.push(entry);
    byLetter.set(entry.source.letter, list);
  }
  for (const list of byLetter.values()) {
    list.sort((a, b) => collator.compare(a.headword, b.headword));
  }
  const letters = [...byLetter.keys()].sort();
  return { entries, byId, byLetter, letters, index: createIndex(entries) };
}

let cached: Promise<Dictionary> | undefined;

/** Fetches dictionary.json once per page load and builds the lookup tables and search index. */
export function loadDictionary(fetchImpl: typeof fetch = fetch): Promise<Dictionary> {
  cached ??= fetchImpl(`${import.meta.env.BASE_URL}data/dictionary.json`).then(async (res) => {
    if (!res.ok) throw new Error(`dictionary.json: HTTP ${res.status}`);
    return buildDictionary((await res.json()) as DictionaryEntry[]);
  });
  return cached;
}

/** Test hook: forget the cached promise. */
export function resetDictionaryCache(): void {
  cached = undefined;
}
