/**
 * window.localStorage, or null when it is unavailable. Browsers that block site data throw on the
 * property read itself, not only on getItem and setItem, so every caller goes through this guard.
 */
export function safeLocalStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}
