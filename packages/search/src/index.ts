import { fold, normaliseApostrophes, type DictionaryEntry } from '@adp/data';
import MiniSearch, { type SearchResult } from 'minisearch';

/** Search direction, stored in the URL as ?dir=. */
export type Direction = 'abr-it' | 'it-abr' | 'en' | 'any';
export const DIRECTIONS: readonly Direction[] = ['abr-it', 'it-abr', 'en', 'any'];

interface Doc {
  id: string;
  headword: string;
  variants: string;
  senses_it: string;
  senses_en: string;
  examples_abr: string;
  examples_it: string;
  examples_en: string;
}

const ALL_FIELDS: (keyof Doc)[] = [
  'headword',
  'variants',
  'senses_it',
  'senses_en',
  'examples_abr',
  'examples_it',
  'examples_en',
];

const FIELDS_BY_DIRECTION: Record<Direction, (keyof Doc)[]> = {
  'abr-it': ['headword', 'variants', 'examples_abr'],
  'it-abr': ['senses_it', 'examples_it'],
  en: ['senses_en', 'examples_en'],
  any: ALL_FIELDS,
};

const BOOST: Partial<Record<keyof Doc, number>> = {
  headword: 3,
  variants: 2.5,
  senses_it: 1.5,
  senses_en: 1.5,
  examples_abr: 0.6,
  examples_it: 0.5,
  examples_en: 0.5,
};

function toDoc(e: DictionaryEntry): Doc {
  return {
    id: e.id,
    headword: e.headword,
    variants: (e.variants ?? []).join(' '),
    senses_it: e.senses.map((s) => s.it).join(' '),
    senses_en: e.senses.flatMap((s) => (s.en ? [s.en] : [])).join(' '),
    examples_abr: (e.examples ?? []).map((x) => x.abr).join(' '),
    examples_it: (e.examples ?? []).flatMap((x) => (x.it ? [x.it] : [])).join(' '),
    examples_en: (e.examples ?? []).flatMap((x) => (x.en ? [x.en] : [])).join(' '),
  };
}

export interface DictionaryIndex {
  search(query: string, direction?: Direction): SearchResult[];
  /** Number of indexed entries. */
  readonly size: number;
}

/**
 * Words are runs of letters, digits, apostrophes and hyphens; every other character (commas,
 * slashes, quotation marks, brackets) separates words and is never searchable. The same split
 * runs on indexed text and on queries.
 */
function tokenize(text: string): string[] {
  return normaliseApostrophes(text)
    .split(/[^\p{L}\p{M}\p{N}'-]+/u)
    .filter(Boolean);
}

/** Apostrophes and hyphens join the letters around them: "c-i-arva" and "c'arva" read as one word. */
const JOINERS = /['-]/;

/** Fold a word and drop its joiners: "C-i-arvà" becomes "ciarva". */
function joinTerm(term: string): string {
  return fold(term).replace(/-/g, '');
}

/** Query side: join only, so "c-i", "ci" and "all'indietro" look for "ci" and "allindietro". */
function queryTerm(term: string): string | null {
  const joined = joinTerm(term);
  return joined.length > 0 ? joined : null;
}

/**
 * Index side: a word is stored joined ("c-i-arva" as "ciarva", "cap'abballe" as "capabballe"), so
 * typing it without punctuation finds it from the first letters. The parts around each joiner
 * are stored as well, so the Italian word after an elided article ("all'indietro", "l'acqua") is
 * found by "indietro" or "acqua". One-letter parts are dropped.
 */
function indexTerms(term: string): string[] | null {
  const joined = joinTerm(term);
  if (joined.length === 0) return null;
  const parts = term
    .split(JOINERS)
    .map(fold)
    .filter((part) => part.length > 1 && part !== joined);
  return [joined, ...new Set(parts)];
}

/** Build an in-memory index. Roughly 50-100 ms for 3,300 entries on a laptop. */
export function createIndex(entries: readonly DictionaryEntry[]): DictionaryIndex {
  const mini = new MiniSearch<Doc>({
    fields: ALL_FIELDS,
    storeFields: ['headword'],
    tokenize,
    processTerm: indexTerms,
  });
  mini.addAll(entries.map(toDoc));

  return {
    size: mini.documentCount,
    search(query, direction = 'any') {
      const q = query.trim();
      if (q.length === 0) return [];
      return mini.search(q, {
        fields: FIELDS_BY_DIRECTION[direction],
        processTerm: queryTerm,
        boost: BOOST,
        prefix: true,
        fuzzy: (term) => (term.length > 3 ? 0.2 : false),
        combineWith: 'AND',
      });
    },
  };
}
