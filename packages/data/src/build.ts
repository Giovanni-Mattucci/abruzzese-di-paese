import { type SourceFragment, withTextFragment } from './source-fragment';
import type { DictionaryEntry, Entry } from './types';

/** Strip provenance-only fields so the browser payload stays small. */
export function toDictionaryEntry(entry: Entry, fragment?: SourceFragment): DictionaryEntry {
  const { source, schemaVersion: _v, contributors: _c, ...rest } = entry;
  return {
    ...rest,
    source: { letter: source.letter, url: withTextFragment(source.url, fragment) },
  };
}

/** `fragments` maps entry ids to the text fragment of their source line (source-fragments.json). */
export function buildDictionary(
  entries: Entry[],
  fragments: Readonly<Record<string, SourceFragment>> = {},
): DictionaryEntry[] {
  return [...entries]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((entry) => toDictionaryEntry(entry, fragments[entry.id]));
}
