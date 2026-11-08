import { describe, expect, it } from 'vitest';
import { isFlagEnabled } from './flags';

const noStorage = { getItem: () => null };

describe('isFlagEnabled', () => {
  it('defaults to false', () => {
    expect(isFlagEnabled('DESIGN_V2', { search: '', storage: noStorage, env: {} })).toBe(false);
  });

  it('reads the build env', () => {
    const env = { VITE_FLAG_DESIGN_V2: 'true' };
    expect(isFlagEnabled('DESIGN_V2', { search: '', storage: noStorage, env })).toBe(true);
  });

  it('lets localStorage override the env', () => {
    const env = { VITE_FLAG_DESIGN_V2: 'true' };
    const storage = { getItem: (k: string) => (k === 'flag:DESIGN_V2' ? '0' : null) };
    expect(isFlagEnabled('DESIGN_V2', { search: '', storage, env })).toBe(false);
  });

  it('lets the query string override everything', () => {
    const env = { VITE_FLAG_DESIGN_V2: 'false' };
    const storage = { getItem: () => '0' };
    expect(isFlagEnabled('DESIGN_V2', { search: '?flag_DESIGN_V2=1', storage, env })).toBe(true);
  });

  it('ignores unrecognised values', () => {
    const storage = { getItem: () => 'maybe' };
    expect(isFlagEnabled('DESIGN_V2', { search: '?flag_DESIGN_V2=yes', storage, env: {} })).toBe(
      false,
    );
  });

  it('survives a throwing storage', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
    };
    expect(isFlagEnabled('DESIGN_V2', { search: '', storage, env: {} })).toBe(false);
  });
});
