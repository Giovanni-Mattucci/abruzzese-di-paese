import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as DictionaryModule from '../../data/dictionary';
import { buildDictionary } from '../../data/dictionary';
import { fulfilled } from '../../data/thenable';
import { renderApp } from '../../test/render';

vi.mock('../../data/dictionary', async (importOriginal) => {
  const { mockDictionary } = await import('../../test/mock-dictionary');
  return mockDictionary(await importOriginal<typeof DictionaryModule>());
});

afterEach(() => {
  window.localStorage.clear();
});

describe('SearchPage', () => {
  it('searches as you type, announces the count, and links to entries', async () => {
    renderApp('/');
    const box = await screen.findByRole('searchbox', { name: 'Search the dictionary' });
    await userEvent.type(box, 'ardeca');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 result'));
    expect(screen.getByRole('link', { name: 'ardeca' })).toHaveAttribute('href', '/word/a-ardeca');
  });

  it('restores query and direction from the URL', async () => {
    renderApp('/?q=ortica&dir=it-abr');
    expect(await screen.findByRole('searchbox')).toHaveValue('ortica');
    expect(screen.getByRole('radio', { name: 'Italian to Abruzzese' })).toBeChecked();
    expect(await screen.findByRole('link', { name: 'ardeca' })).toBeInTheDocument();
  });

  it('shows English glosses with the unverified badge and offers the English direction', async () => {
    renderApp('/?q=nettle&dir=en');
    expect(await screen.findByRole('radio', { name: 'English' })).toBeChecked();
    expect(await screen.findByText('nettle')).toBeInTheDocument();
    expect(screen.getByText('Unverified translation')).toBeInTheDocument();
  });

  it('keeps the caret in place when correcting a typo inside the query', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const box = await screen.findByRole('searchbox', { name: 'Search the dictionary' });
    await user.type(box, 'ortca');
    await user.type(box, 'i', { initialSelectionStart: 3, initialSelectionEnd: 3 });
    await user.keyboard('x');
    expect(box).toHaveValue('ortixca');
  });

  it('takes the query from the URL again after an outside navigation', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/?q=ortica');
    const box = await screen.findByRole('searchbox');
    await user.type(box, 'x');
    expect(box).toHaveValue('orticax');
    await act(() => router.navigate('/?q=sorete'));
    expect(box).toHaveValue('sorete');
    await act(() => router.navigate(-1));
    expect(box).toHaveValue('orticax');
  });

  it('pages through more results than fit on one page', async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 120 }, (_, i) => ({
      id: `p-parola-${i}`,
      headword: `parola${i}`,
      senses: [{ it: 'parola' }],
      source: { letter: 'p', url: 'https://example.test/p.html' },
    }));
    const { router } = renderApp('/?q=parola&dir=abr-it', {
      dictionary: fulfilled(buildDictionary(many)),
    });
    expect(await screen.findByText('120 results. Page 1 of 3')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(50);

    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    await user.click(within(nav).getByRole('link', { name: 'Next' }));
    expect(await screen.findByText('120 results. Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveValue('parola');
    expect(screen.getByRole('radio', { name: 'Abruzzese to Italian' })).toBeChecked();

    await user.click(within(nav).getByRole('link', { name: 'Next' }));
    expect(await screen.findByText('120 results. Page 3 of 3')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(20);

    // Typing a different query starts again at the first page.
    await user.type(screen.getByRole('searchbox'), '1');
    await waitFor(() => expect(router.state.location.search).toBe('?q=parola1&dir=abr-it'));
    expect(screen.queryByText(/Page 3 of/)).not.toBeInTheDocument();
  });

  it('shows a no-results message', async () => {
    renderApp('/?q=zzzz');
    expect(await screen.findByText('No entries match "zzzz".')).toBeInTheDocument();
  });
});
