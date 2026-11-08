/** Browser-safe surface: types, text folding and the dictionary shape. Node-only tooling lives in ./node. */
export type {
  DictionaryEntry,
  Entry,
  EntrySource,
  EntryTag,
  Example,
  Sense,
  TranslateStatus,
} from './types';
export { fold, normaliseApostrophes, slugify, uniqueSlug } from './text';
export { buildDictionary, toDictionaryEntry } from './build';
export { type SourceFragment, withTextFragment } from './source-fragment';
