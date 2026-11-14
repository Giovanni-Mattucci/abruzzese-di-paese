import { test as base } from '@playwright/test';

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
