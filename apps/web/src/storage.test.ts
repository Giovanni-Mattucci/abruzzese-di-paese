import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeLocalStorage } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('safeLocalStorage', () => {
  it('returns localStorage when the browser allows it', () => {
    expect(safeLocalStorage()).toBe(window.localStorage);
  });

  it('returns null when reading the property throws (site data blocked)', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });
    expect(safeLocalStorage()).toBeNull();
  });
});
