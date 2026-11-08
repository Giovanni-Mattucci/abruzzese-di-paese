/**
 * Build-time feature flags with runtime overrides for testing.
 *
 * Resolution order, first match wins:
 *   1. query string   ?flag_DESIGN_V2=1 | 0
 *   2. localStorage   flag:DESIGN_V2 = "1" | "0"
 *   3. build env      VITE_FLAG_DESIGN_V2 = "true" | "false"
 *   4. default        false
 *
 * Flags give a controlled rollout and a one-line rollback (change the env, redeploy).
 */
export const FLAG_NAMES = ['DESIGN_V2'] as const;
export type FlagName = (typeof FLAG_NAMES)[number];

export interface FlagSources {
  /** Query string including the leading "?"; defaults to window.location.search. */
  search?: string;
  /** Key-value store; defaults to window.localStorage. Pass null to disable. */
  storage?: Pick<Storage, 'getItem'> | null;
  /** Build-time env; defaults to import.meta.env. */
  env?: Record<string, string | undefined>;
}

function parseSwitch(value: string | null | undefined): boolean | undefined {
  if (value == null) return undefined;
  const v = value.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'on') return true;
  if (v === '0' || v === 'false' || v === 'off') return false;
  return undefined;
}

function defaultStorage(): Pick<Storage, 'getItem'> | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function isFlagEnabled(name: FlagName, sources: FlagSources = {}): boolean {
  const search = sources.search ?? (typeof window !== 'undefined' ? window.location.search : '');
  const storage = sources.storage === undefined ? defaultStorage() : sources.storage;
  const env = sources.env ?? (import.meta.env as Record<string, string | undefined>);

  const fromQuery = parseSwitch(new URLSearchParams(search).get(`flag_${name}`));
  if (fromQuery !== undefined) return fromQuery;

  let fromStorage: boolean | undefined;
  try {
    fromStorage = parseSwitch(storage?.getItem(`flag:${name}`));
  } catch {
    fromStorage = undefined;
  }
  if (fromStorage !== undefined) return fromStorage;

  return parseSwitch(env[`VITE_FLAG_${name}`]) ?? false;
}
