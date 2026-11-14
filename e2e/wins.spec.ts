import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('capture a win', () => {
  test.use({ locale: 'de-CH' });

  test('a German user saves a win and still sees it after a reload', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Meine Wins' })).toBeVisible();
    await expect(page.getByText('Noch keine Wins')).toBeVisible();

    await page.getByLabel('Dein Win').fill('10 km gelaufen');
    await page.getByRole('radio', { name: 'Gesundheit' }).click();
    await page.getByRole('button', { name: 'Win speichern' }).click();

    const item = page.getByRole('listitem').filter({ hasText: '10 km gelaufen' });
    await expect(item).toBeVisible();
    await expect(item).toContainText('Gesundheit');
    await expect(page.getByText('Noch keine Wins')).toBeHidden();
    await expect(page.getByLabel('Dein Win')).toHaveValue('');

    await page.reload();
    await expect(page.getByRole('listitem').filter({ hasText: '10 km gelaufen' })).toBeVisible();
  });

  test('saving without text shows a validation message', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Win speichern' }).click();

    await expect(page.getByRole('alert')).toHaveText('Schreib kurz auf, was dir gelungen ist.');
    await expect(page.getByRole('listitem')).toHaveCount(0);
  });
});

test.describe('languages', () => {
  test('an Italian device gets the Italian UI', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'it-CH' });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'I miei successi' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
    await context.close();
  });

  test('an unsupported device language falls back to English', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'fr-FR' });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'My wins' })).toBeVisible();
    await context.close();
  });

  test('the chosen language survives a reload', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'de-CH' });
    const page = await context.newPage();
    await page.goto('/');

    await page.getByRole('radio', { name: 'English' }).click();
    await expect(page.getByRole('heading', { name: 'My wins' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'My wins' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'English' })).toBeChecked();
    await context.close();
  });
});

test.describe('accessibility', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`no automatically detectable WCAG A/AA violations in ${colorScheme} mode`, async ({ browser }) => {
      const context = await browser.newContext({ locale: 'en-GB', colorScheme });
      const page = await context.newPage();
      await page.goto('/');
      await page.getByLabel('Your win').fill('Went for a walk');
      await page.getByRole('button', { name: 'Save win' }).click();
      await expect(page.getByRole('listitem')).toHaveCount(1);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
      await context.close();
    });
  }
});
