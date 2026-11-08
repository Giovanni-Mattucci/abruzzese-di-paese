/** Project-level constants. The repository URL is set at build time once the remote exists. */
export const REPO_URL =
  import.meta.env.VITE_REPO_URL ?? 'https://github.com/Giovanni-Mattucci/abruzzese-di-paese';
export const SOURCE_INDEX_URL = 'https://www.abruzzo.fm/archivio/treppecore/treppecore.html';
/** abruzzo.fm is Radio Abruzzo; its editors asked to be credited under that name. */
export const RADIO_ABRUZZO_URL = 'https://www.abruzzo.fm/';
export const RESULTS_LIMIT = 50;
export const BROWSE_PAGE_SIZE = 50;

export function entryEditUrl(letter: string, id: string): string {
  return `${REPO_URL}/edit/main/packages/data/entries/${letter}/${id}.json`;
}

export function reportEntryUrl(id: string): string {
  const params = new URLSearchParams({
    template: 'fix-entry.yml',
    title: `[Fix] ${id}`,
    entry: id,
  });
  return `${REPO_URL}/issues/new?${params.toString()}`;
}

export function helpTranslateUrl(): string {
  return `${REPO_URL}/blob/main/CONTRIBUTING.md`;
}
