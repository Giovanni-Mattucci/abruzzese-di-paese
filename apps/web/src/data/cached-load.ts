export interface CachedLoad<T> {
  /** Starts the load on the first call and returns the same promise on every later call. */
  load: () => Promise<T>;
  /** Drops the promise only if it was rejected, so the next `load` tries again. */
  forgetFailure: () => void;
  /** Drops the promise whatever its state. */
  reset: () => void;
}

/**
 * Loads something once per page load. React's use() needs the same promise on every render, so a
 * rejected promise stays cached while the error is on screen: dropping it at the moment it rejects
 * would make the retry render start a new request, and a server that is down would be asked again
 * in a loop. The error page calls `forgetFailure` instead, once the failure has been shown.
 */
export function cachedLoad<T>(start: () => Promise<T>): CachedLoad<T> {
  let cached: Promise<T> | undefined;
  let failed = false;
  const reset = () => {
    cached = undefined;
    failed = false;
  };
  return {
    load() {
      if (!cached) {
        const promise = start();
        cached = promise;
        promise.catch(() => {
          // Ignore a load that was reset while it was still in flight.
          if (cached === promise) failed = true;
        });
      }
      return cached;
    },
    forgetFailure() {
      if (failed) reset();
    },
    reset,
  };
}
