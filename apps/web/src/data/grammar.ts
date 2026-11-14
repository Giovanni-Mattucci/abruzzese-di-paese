import { cachedLoad } from './cached-load';

const grammar = cachedLoad(async (fetchImpl: typeof fetch = fetch) => {
  const res = await fetchImpl(`${import.meta.env.BASE_URL}data/grammar.html`);
  if (!res.ok) throw new Error(`grammar.html: HTTP ${res.status}`);
  return res.text();
});

/** grammar.html is generated at build time from packages/data/grammar/regole.md by pnpm data:build. */
export const loadGrammar = grammar.load;

/** After a failed fetch has been shown, let the next visit to the page try again. */
export const forgetFailedGrammar = grammar.forgetFailure;
