import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as DictionaryModule from '../data/dictionary';
import { renderApp } from '../test/render';

// Layout calls loadDictionary(); serve the in-memory sample instead of fetching.
vi.mock('../data/dictionary', async (importOriginal) => {
  const actual = await importOriginal<typeof DictionaryModule>();
  const { sampleEntries } = await import('../test/sample');
  // One stable, already-fulfilled thenable: React's use() reads a thenable whose
  // status is "fulfilled" synchronously, so the tree never suspends under act().
  const { fulfilled } = await import('../data/thenable');
  const promise = fulfilled(actual.buildDictionary(sampleEntries));
  return { ...actual, loadDictionary: () => promise };
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

describe('EntryPage', () => {
  it('renders the full entry with source and edit links', async () => {
    renderApp('/word/a-abbija');
    expect(await screen.findByRole('heading', { level: 1, name: 'abbijà' })).toBeInTheDocument();
    expect(screen.getByText('abbije a magnà')).toBeInTheDocument();
    expect(screen.getByText('Passato remoto: j abbijve')).toBeInTheDocument();
    expect(screen.getByText('Possible duplicate')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit this entry on GitHub' })).toHaveAttribute(
      'href',
      expect.stringContaining('/edit/main/packages/data/entries/a/a-abbija.json'),
    );
    expect(screen.getByRole('link', { name: 'Report a problem' })).toHaveAttribute(
      'href',
      expect.stringContaining('entry=a-abbija'),
    );
    expect(document.title).toBe('abbijà · Abruzzese di paese');
  });

  it('shows not found for an unknown id', async () => {
    renderApp('/word/x-nope');
    expect(await screen.findByText('No entry with id "x-nope".')).toBeInTheDocument();
  });
});

describe('NotFoundPage', () => {
  it('renders for unknown routes', async () => {
    renderApp('/nothing/here');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Page not found');
  });
});
