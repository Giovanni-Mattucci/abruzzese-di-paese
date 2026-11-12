import { screen, within } from '@testing-library/react';
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

describe('BrowsePage', () => {
  it('lists the letter with the current letter marked', async () => {
    renderApp('/browse/a');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Words starting with A',
    );
    expect(
      within(screen.getByRole('navigation', { name: 'Letters' })).getByRole('link', { name: 'a' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('2 entries. Page 1 of 1')).toBeInTheDocument();
  });

  it('treats an upper-case letter in the URL like its lower-case form', async () => {
    renderApp('/browse/A');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Words starting with A',
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('explains an unknown letter', async () => {
    renderApp('/browse/k');
    expect(
      await screen.findByText('There is no letter "k" in the dictionary.'),
    ).toBeInTheDocument();
  });
});
