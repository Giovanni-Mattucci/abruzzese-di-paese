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

  it('says there is no tracking when the analytics token is unset', async () => {
    vi.stubEnv('VITE_CF_ANALYTICS_TOKEN', '');
    renderApp('/about', { eagerPages: { AboutPage } });
    expect(await screen.findByText(/uses no analytics or tracking/)).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('describes Cloudflare Web Analytics when the token is set', async () => {
    vi.stubEnv('VITE_CF_ANALYTICS_TOKEN', '33b146eedfd74187a52700c51ad086f9');
    renderApp('/about', { eagerPages: { AboutPage } });
    expect(await screen.findByText(/Cloudflare Web Analytics/)).toBeInTheDocument();
    vi.unstubAllEnvs();
  });
});
