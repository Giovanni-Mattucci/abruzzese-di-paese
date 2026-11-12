import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as DictionaryModule from '../data/dictionary';
import { renderApp } from '../test/render';

vi.mock('../data/dictionary', async (importOriginal) => {
  const { mockDictionary } = await import('../test/mock-dictionary');
  return mockDictionary(await importOriginal<typeof DictionaryModule>());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('route change handling', () => {
  it('scrolls to the top and focuses main after following a link', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    renderApp('/browse/a');
    await userEvent.click(await screen.findByRole('link', { name: 'ardeca' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'ardeca' })).toBeInTheDocument();
    expect(document.activeElement).toBe(document.getElementById('main'));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('leaves focus alone on first load and while typing a search', async () => {
    renderApp('/');
    const box = await screen.findByRole('searchbox');
    expect(document.activeElement).not.toBe(document.getElementById('main'));
    await userEvent.type(box, 'ard');
    expect(document.activeElement).toBe(box);
  });

  it('focuses main after back navigation', async () => {
    const { router } = renderApp('/browse/a');
    await userEvent.click(await screen.findByRole('link', { name: 'ardeca' }));
    await act(() => router.navigate(-1));
    expect(document.activeElement).toBe(document.getElementById('main'));
  });
});
