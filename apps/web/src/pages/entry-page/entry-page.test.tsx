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
