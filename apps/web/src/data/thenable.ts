/**
 * A promise already marked fulfilled the way React's use() checks, so use() reads the value
 * synchronously instead of suspending. Used by server rendering and by tests.
 */
export function fulfilled<T>(value: T): Promise<T> {
  return Object.assign(Promise.resolve(value), { status: 'fulfilled', value });
}
