/** Whether an English gloss is unchecked machine output or has been reviewed by a person. */
export type TranslateStatus = 'machine' | 'reviewed';
export type EntryTag = 'needs-review' | 'possible-duplicate';

export interface Sense {
  it: string;
  en?: string;
  enTranslateStatus?: TranslateStatus;
  notes?: string;
}

export interface Example {
  abr: string;
  it?: string;
  en?: string | null;
  enTranslateStatus?: TranslateStatus;
}

export interface EntrySource {
  site: 'abruzzo.fm';
  letter: string;
  url: string;
  raw: string;
  rawHash: string;
  scrapedAt: string;
}

/** Shape of one file under packages/data/entries/{letter}/{id}.json. */
export interface Entry {
  id: string;
  headword: string;
  variants?: string[];
  /** Dialect article recorded with the headword, e.g. lu, la. */
  article?: string;
  pos?: string;
  pronunciation?: string;
  locality?: string[];
  senses: Sense[];
  examples?: Example[];
  etymology?: string;
  grammarNotes?: string[];
  notes?: string[];
  tags?: EntryTag[];
  source: EntrySource;
  contributors?: string[];
  schemaVersion: 1;
}

/** Shape shipped to the browser in dictionary.json: translation status kept, raw source dropped. */
export type DictionaryEntry = Omit<Entry, 'source' | 'schemaVersion' | 'contributors'> & {
  source: Pick<EntrySource, 'letter' | 'url'>;
};
