let cached: Promise<string> | undefined;

/** grammar.html is generated at build time from packages/data/grammar/regole.md by pnpm data:build. */
export function loadGrammar(fetchImpl: typeof fetch = fetch): Promise<string> {
  cached ??= fetchImpl(`${import.meta.env.BASE_URL}data/grammar.html`).then((res) => {
    if (!res.ok) throw new Error(`grammar.html: HTTP ${res.status}`);
    return res.text();
  });
  return cached;
}
