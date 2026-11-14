import { describe, expect, it } from 'vitest';
import { paginate } from './paginate';

const items = Array.from({ length: 125 }, (_, i) => i + 1);

describe('paginate', () => {
  it('returns the first page when no page is given', () => {
    expect(paginate(items, null, 50)).toMatchObject({ page: 1, pages: 3 });
    expect(paginate(items, null, 50).items).toHaveLength(50);
  });

  it('returns the remainder on the last page', () => {
    const last = paginate(items, '3', 50);
    expect(last.items).toEqual(items.slice(100));
  });

  it('lands on a whole page in range for fractional, negative, huge and non-numeric values', () => {
    expect(paginate(items, '1.5', 50).page).toBe(2);
    expect(paginate(items, '-4', 50).page).toBe(1);
    expect(paginate(items, '99', 50).page).toBe(3);
    expect(paginate(items, 'abc', 50).page).toBe(1);
  });

  it('reports one empty page for an empty list', () => {
    expect(paginate([], '2', 50)).toEqual({ page: 1, pages: 1, items: [] });
  });
});
