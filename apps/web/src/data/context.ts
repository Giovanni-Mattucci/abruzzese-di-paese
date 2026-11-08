import { createContext, useContext } from 'react';
import type { Dictionary } from './dictionary';

export const DictionaryContext = createContext<Dictionary | null>(null);

export function useDictionary(): Dictionary {
  const value = useContext(DictionaryContext);
  if (!value) throw new Error('useDictionary must be used inside DictionaryProvider');
  return value;
}
