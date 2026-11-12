import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as DictionaryModule from '../../data/dictionary';
import { renderApp } from '../../test/render';

vi.mock('../../data/dictionary', async (importOriginal) => {
  const { mockDictionary } = await import('../../test/mock-dictionary');
  return mockDictionary(await importOriginal<typeof DictionaryModule>());
});

afterEach(() => {
  window.localStorage.clear();
});

describe('NotFoundPage', () => {
  it('renders for unknown routes', async () => {
    renderApp('/nothing/here');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Page not found');
  });
});
