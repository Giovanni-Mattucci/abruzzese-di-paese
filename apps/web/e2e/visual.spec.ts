import { expect, test } from '@playwright/test';

// Visual snapshots are platform-dependent, so they run only when E2E_VISUAL=1, which the E2E
// workflow sets on Linux. Baseline file names carry a platform suffix (-linux, -win32, -darwin).
// Bootstrap or refresh: see "Visual snapshots" in CONTRIBUTING.md.
test.skip(!process.env['E2E_VISUAL'], 'set E2E_VISUAL=1 to run visual snapshots');

for (const [name, path] of [
  ['search', '/?q=ortica&dir=it-abr'],
  ['entry', '/word/a-abbija'],
  ['browse', '/browse/s'],
] as const) {
  test(`${name} page looks as expected`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, maxDiffPixelRatio: 0.01 });
  });
}
