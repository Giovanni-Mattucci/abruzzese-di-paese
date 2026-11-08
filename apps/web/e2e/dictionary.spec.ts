import { expect, test } from '@playwright/test';
import { expectAccessible } from './axe';

test('search Abruzzese to Italian and open the entry', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search the dictionary' }).fill('ardeca');
  await expect(page.getByRole('status')).toContainText('result');
  await page
    .getByRole('link', { name: /ardeca/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/word\/a-ardeca$/);
  await expect(page.getByRole('heading', { level: 1, name: /ardeca/ })).toBeVisible();
  await expect(page.getByText('ortica')).toBeVisible();
  await expectAccessible(page);
});

test('search Italian to Abruzzese reaches the same entry', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: 'Italian to Abruzzese' }).click();
  await expect(page.getByRole('radio', { name: 'Italian to Abruzzese' })).toBeChecked();
  await page.getByRole('searchbox', { name: 'Search the dictionary' }).fill('ortica');
  await expect(page).toHaveURL(/dir=it-abr/);
  await expect(page.getByRole('link', { name: /ardeca/ }).first()).toBeVisible();
  await expectAccessible(page);
});

test('browse letter S, paginate, open an entry', async ({ page }) => {
  await page.goto('/browse/s');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('S');
  await expect(
    page.getByRole('navigation', { name: 'Letters' }).getByRole('link', { name: 's' }),
  ).toHaveAttribute('aria-current', 'page');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page
    .getByRole('navigation', { name: 'Pagination' })
    .getByRole('link', { name: 'Next' })
    .click();
  await expect(page).toHaveURL(/page=2/);
  // A new page starts at the top, with focus on the main content.
  await expect(page.locator('#main')).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByRole('article').first().getByRole('link').click();
  await expect(page).toHaveURL(/\/word\/s-/);
  await expectAccessible(page);
});

test('searching in every direction finds Abruzzese, Italian and English', async ({ page }) => {
  for (const q of ['ardeca', 'ortica', 'nettle']) {
    await page.goto(`/?dir=any&q=${q}`);
    await expect(page.getByRole('link', { name: /ardeca/ }).first()).toBeVisible();
  }
  await expectAccessible(page);
});

test('a shared search URL restores its state', async ({ page }) => {
  await page.goto('/?q=ortica&dir=it-abr');
  await expect(page.getByRole('searchbox')).toHaveValue('ortica');
  await expect(page.getByRole('radio', { name: 'Italian to Abruzzese' })).toBeChecked();
  await expect(page.getByRole('link', { name: /ardeca/ }).first()).toBeVisible();
});

test('grammar and about pages render and are accessible', async ({ page }) => {
  await page.goto('/grammar');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('rules');
  await expect(page.getByText('Qualcosa da sapere')).toBeVisible();
  await expectAccessible(page);
  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('About');
  await expectAccessible(page);
});

test('deep link to an unknown word shows not found', async ({ page }) => {
  await page.goto('/word/zz-nope');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('not found');
});

test('switching the UI to Italian persists across reloads', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('group', { name: 'Language' })
    .getByRole('button', { name: 'Italiano' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Un dizionario del dialetto abruzzese',
  );
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Un dizionario del dialetto abruzzese',
  );
  await expect(page.getByRole('searchbox', { name: 'Cerca nel dizionario' })).toBeVisible();
  await page
    .getByRole('group', { name: 'Lingua' })
    .getByRole('button', { name: 'English' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'A dictionary of the Abruzzese dialect',
  );
});

test('English direction shows glosses and the unverified badge', async ({ page }) => {
  await page.goto('/?q=nettle&dir=en');
  await expect(page.getByRole('radio', { name: 'English' })).toBeChecked();
  await expect(page.getByRole('link', { name: /ardeca/ }).first()).toBeVisible();
  await expect(page.getByText('Unverified translation').first()).toBeVisible();
});

test('keyboard users can skip to the main content', async ({ page }) => {
  await page.goto('/browse/a');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator('#main')).toBeFocused();
});

test('prerendered entry page is readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/word/a-ardeca');
  await expect(page.getByRole('heading', { level: 1, name: /ardeca/ })).toBeVisible();
  await expect(page.getByText('ortica')).toBeVisible();
  await expect(page).toHaveTitle('ardeca · Abruzzese di paese');
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(jsonLd ?? '{}')).toMatchObject({ '@type': 'DefinedTerm', name: 'ardeca' });
  await context.close();
});

test('sitemap, robots and llms.txt are served', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('/word/a-ardeca</loc>');
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap:');
  const llms = await request.get('/llms.txt');
  expect(await llms.text()).toContain('# Abruzzese di paese');
});

test('prerendered pages hydrate without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  for (const path of ['/word/a-ardeca', '/browse/s', '/grammar', '/']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForLoadState('networkidle');
  }
  expect(errors).toEqual([]);
});
