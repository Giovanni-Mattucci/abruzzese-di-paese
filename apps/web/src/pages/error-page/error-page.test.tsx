import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetDictionaryCache } from '../../data/dictionary';
import { renderApp, sampleEntries } from '../../test/render';

afterEach(() => {
  resetDictionaryCache();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** A fetch that fails `failures` times, then serves the sample dictionary. */
function flakyFetch(failures: number) {
  let calls = 0;
  const fetchMock = vi.fn(async () => {
    calls += 1;
    if (calls <= failures) throw new TypeError('Failed to fetch');
    return new Response(JSON.stringify(sampleEntries), { status: 200 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** The page suspends on a real fetch here, and React only settles that inside an awaited act(). */
async function renderSuspending(path: string) {
  await act(async () => {
    renderApp(path);
  });
}

/** A click that makes the page fetch again, which suspends it just as the first render does. */
async function clickSuspending(element: HTMLElement) {
  await act(async () => {
    await userEvent.click(element);
  });
}

describe('ErrorPage', () => {
  it('fetches the dictionary again when "Try again" is pressed', async () => {
    // React logs the render error it hands to the error page.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = flakyFetch(1);
    await renderSuspending('/browse/a');
    expect(
      await screen.findByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument();
    // One request only: the failure is not retried in a loop behind the error page.
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await clickSuspending(screen.getByRole('button', { name: 'Try again' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Words starting with A' }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('recovers through "Go to search" as well', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    flakyFetch(1);
    await renderSuspending('/browse/a');
    await clickSuspending(await screen.findByRole('link', { name: 'Go to search' }));
    expect(await screen.findByRole('searchbox')).toBeInTheDocument();
  });

  it('shows the error again when the retry fails too', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = flakyFetch(2);
    await renderSuspending('/');
    await clickSuspending(await screen.findByRole('button', { name: 'Try again' }));
    expect(
      await screen.findByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
