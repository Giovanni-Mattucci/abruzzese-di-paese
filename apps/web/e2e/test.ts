import { expect, test as base, type Page } from '@playwright/test';

export { expect } from '@playwright/test';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * The suite runs against the artefact that is deployed, which may carry the analytics beacon.
 * Requests to any other host are answered with an empty response, so tests never depend on the
 * network and never send page views.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(
      (url) => !LOCAL_HOSTS.has(url.hostname),
      (route) => route.fulfill({ status: 204, body: '' }),
    );
    await use(context);
  },
});

/**
 * Waits until the page responds to input. A prerendered page is on screen before its scripts and
 * dictionary.json have loaded, and a click or keystroke in that window lands on markup with no
 * handlers. Call it after a navigation or reload and before the first interaction.
 */
export async function appReady(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-app-ready', '');
}
