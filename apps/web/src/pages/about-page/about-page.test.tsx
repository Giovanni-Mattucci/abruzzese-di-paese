import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as DictionaryModule from '../../data/dictionary';
import { renderApp } from '../../test/render';
import { AboutPage } from './about-page';

vi.mock('../../data/dictionary', async (importOriginal) => {
  const { mockDictionary } = await import('../../test/mock-dictionary');
  return mockDictionary(await importOriginal<typeof DictionaryModule>());
});

afterEach(() => {
  window.localStorage.clear();
});

describe('AboutPage', () => {
  it('credits abruzzo.fm as Radio Abruzzo with a link to its homepage', async () => {
    renderApp('/about', { eagerPages: { AboutPage } });
    expect(await screen.findByRole('link', { name: 'Radio Abruzzo' })).toHaveAttribute(
      'href',
      'https://www.abruzzo.fm/',
    );
  });
});
