import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('shows a no-results message', async () => {
    renderApp('/?q=zzzz');
    expect(await screen.findByText('No entries match "zzzz".')).toBeInTheDocument();
  });
});
