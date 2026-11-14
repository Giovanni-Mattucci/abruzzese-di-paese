import { use, useEffect, useState, type ReactNode } from 'react';
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
  // Set once the page under the provider responds to input; until then it is prerendered markup.
  useEffect(() => document.documentElement.setAttribute('data-app-ready', ''), []);
  return <DictionaryContext value={dictionary}>{children}</DictionaryContext>;
}
