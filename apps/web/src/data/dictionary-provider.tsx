import { use, useState, type ReactNode } from 'react';
import { DictionaryContext } from './context';
import { loadDictionary, type Dictionary } from './dictionary';

/** Suspends until dictionary.json is loaded; wrap in <Suspense>. */
export function DictionaryProvider({
  children,
  promise,
}: {
  children: ReactNode;
  promise?: Promise<Dictionary>;
}) {
  // use() needs the same promise on every render; keep it in state so a default is created once.
  const [resolved] = useState(() => promise ?? loadDictionary());
  const dictionary = use(resolved);
  return <DictionaryContext value={dictionary}>{children}</DictionaryContext>;
}
