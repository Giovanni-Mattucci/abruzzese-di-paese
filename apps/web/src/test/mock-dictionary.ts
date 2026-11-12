import type * as DictionaryModule from '../data/dictionary';
import { fulfilled } from '../data/thenable';
import { sampleEntries } from './sample';

/**
 * Factory body for `vi.mock('../data/dictionary', ...)`: Layout calls loadDictionary(), so tests
 * serve the in-memory sample instead of fetching. Each test file still calls vi.mock itself,
 * because Vitest hoists the call within the file that contains it.
 */
export function mockDictionary(actual: typeof DictionaryModule): typeof DictionaryModule {
  // One stable, already-fulfilled thenable: React's use() reads a thenable whose
  // status is "fulfilled" synchronously, so the tree never suspends under act().
  const promise = fulfilled(actual.buildDictionary(sampleEntries));
  return { ...actual, loadDictionary: () => promise };
}
