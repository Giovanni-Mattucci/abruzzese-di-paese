import type { DictionaryEntry } from '@adp/data';

/** Dependency-free sample data so vi.mock factories can import it safely. */
export const sampleEntries: DictionaryEntry[] = [
  {
    id: 'a-ardeca',
    headword: 'ardeca',
    variants: ['ardeche'],
    senses: [{ it: 'ortica', en: 'nettle', enTranslateStatus: 'machine' }],
    source: { letter: 'a', url: 'https://www.abruzzo.fm/archivio/treppecore/a.html' },
  },
  {
    id: 'a-abbija',
    headword: 'abbijà',
    senses: [{ it: 'iniziare' }, { it: 'avviare' }],
    examples: [{ abr: 'abbije a magnà', it: 'inizia a mangiare' }],
    grammarNotes: ['Passato remoto: j abbijve'],
    tags: ['possible-duplicate'],
    source: { letter: 'a', url: 'https://www.abruzzo.fm/archivio/treppecore/a.html' },
  },
  {
    id: 's-sorete',
    headword: 'sorete',
    article: 'la',
    senses: [{ it: 'tua sorella' }],
    source: { letter: 's', url: 'https://www.abruzzo.fm/archivio/treppecore/s.html' },
  },
];
