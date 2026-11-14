import { describe, expect, it } from 'vitest';
import { cachedLoad } from './cached-load';

describe('cachedLoad', () => {
  it('starts once and returns the same promise', async () => {
    let calls = 0;
    const { load } = cachedLoad(async () => (calls += 1));
    expect(load()).toBe(load());
    expect(await load()).toBe(1);
    expect(calls).toBe(1);
  });

  it('keeps a rejected promise until the failure is forgotten, then loads again', async () => {
    let calls = 0;
    const { load, forgetFailure } = cachedLoad(async () => {
      calls += 1;
      if (calls === 1) throw new Error('offline');
      return 'ok';
    });
    const first = load();
    await expect(first).rejects.toThrow('offline');
    // Still the same rejected promise: a re-render must not start another request.
    expect(load()).toBe(first);
    expect(calls).toBe(1);

    forgetFailure();
    expect(await load()).toBe('ok');
    expect(calls).toBe(2);
  });

  it('does not forget a load that succeeded or is still in flight', async () => {
    let calls = 0;
    const { load, forgetFailure } = cachedLoad(async () => (calls += 1));
    const pending = load();
    forgetFailure();
    expect(load()).toBe(pending);
    await pending;
    forgetFailure();
    expect(load()).toBe(pending);
    expect(calls).toBe(1);
  });
});
