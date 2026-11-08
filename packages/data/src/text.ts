/**
 * Text folding shared by slugs and search. Kept in one tested function because
 * apostrophe and schwa folding can over-merge distinct dialect words.
 */
const APOSTROPHES = /[‘’‚‛′´`]/g;

/** Unify curly and typographic apostrophes to a plain ASCII apostrophe. */
export function normaliseApostrophes(text: string): string {
  return text.replace(APOSTROPHES, "'");
}

/** Lowercase, strip diacritics, map schwa-like letters to e, drop apostrophes. */
export function fold(text: string): string {
  return normaliseApostrophes(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[əƏë]/g, 'e')
    .replace(/'/g, '')
    .trim();
}

/** Stable id for an entry: "<letter>-<folded-headword>". Never regenerate an existing id. */
export function slugify(letter: string, headword: string): string {
  const body = fold(headword)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${letter.toLowerCase()}-${body || 'entry'}`;
}

/** Add -2, -3 ... until the slug is not in `taken`. */
export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
