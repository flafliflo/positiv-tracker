import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Klickt einen Tab in der Hauptnavigation an. */
async function openTab(page: Page, name: string) {
  await page.getByRole('navigation').getByRole('link', { name }).click();
}

test.describe('German user journey', () => {
  test.use({ locale: 'de-CH' });

  test('the today screen greets and all five tabs are reachable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Guten Morgen|Hallo|Guten Abend/);
    await expect(page.getByText('Starte heute deine Serie')).toBeVisible();

    for (const [tab, title] of [
      ['Wins', 'Wins'],
      ['Gedanken', 'Gedanken'],
      ['Gesundheit', 'Gesundheit'],
      ['Fortschritt', 'Fortschritt'],
    ]) {
      await openTab(page, tab);
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    }
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Fortschritt' })).toHaveAttribute('aria-current', 'page');
  });

  test('a win is saved, survives a reload, can be edited and deleted', async ({ page }) => {
    await page.goto('/wins');
    await expect(page.getByText('Noch keine Wins')).toBeVisible();

    await page.getByLabel('Dein Win').fill('10 km gelaufen');
    await page.getByRole('radio', { name: 'Gesundheit' }).click();
    await page.getByRole('button', { name: 'Win speichern' }).click();

    const item = page.getByRole('listitem').filter({ hasText: '10 km gelaufen' });
    await expect(item).toContainText('Gesundheit');
    await expect(item).toContainText('Heute');
    await expect(page.getByLabel('Dein Win')).toHaveValue('');

    await page.reload();
    await expect(page.getByRole('listitem').filter({ hasText: '10 km gelaufen' })).toBeVisible();

    await page.getByRole('listitem').getByRole('button', { name: 'Bearbeiten' }).click();
    await page.getByRole('listitem').getByLabel('Dein Win').fill('12 km gelaufen');
    await page.getByRole('button', { name: 'Änderung speichern' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: '12 km gelaufen' })).toBeVisible();

    await page.getByRole('listitem').getByRole('button', { name: 'Löschen' }).click();
    await page.getByRole('listitem').getByRole('button', { name: 'Löschen' }).click();
    await expect(page.getByText('Noch keine Wins')).toBeVisible();
  });

  test('saving a win without text shows a validation message', async ({ page }) => {
    await page.goto('/wins');

    await page.getByRole('button', { name: 'Win speichern' }).click();

    await expect(page.getByRole('alert')).toHaveText('Schreib kurz auf, was dir gelungen ist.');
    await expect(page.getByRole('listitem')).toHaveCount(0);
  });

  test('a journal entry needs a mood and is then listed', async ({ page }) => {
    await page.goto('/journal');

    await page.getByLabel('Deine Gedanken').fill('Heute lief es rund.');
    await page.getByRole('button', { name: 'Eintrag speichern' }).click();
    await expect(page.getByRole('alert')).toHaveText('Wähle zuerst deine Stimmung.');

    await page.getByRole('radio', { name: 'Gut', exact: true }).click();
    await page.getByRole('button', { name: 'Eintrag speichern' }).click();

    const item = page.getByRole('listitem').filter({ hasText: 'Heute lief es rund.' });
    await expect(item).toContainText('Gut');
    await page.reload();
    await expect(page.getByRole('listitem').filter({ hasText: 'Heute lief es rund.' })).toBeVisible();
  });

  test('health values and habits are tracked for today', async ({ page }) => {
    await page.goto('/health');

    await page.getByRole('textbox', { name: 'Schritte' }).fill("8'421");
    await page.getByRole('button', { name: 'Schritte speichern' }).click();
    await expect(page.getByTestId('metric-0')).toContainText(/8['’]421/);

    await page.getByRole('button', { name: 'Wasser erhöhen' }).click();
    await page.getByRole('button', { name: 'Wasser erhöhen' }).click();
    await expect(page.getByTestId('metric-2')).toContainText('2');

    await page.getByLabel('Neue Gewohnheit').fill('Lesen');
    await page.getByRole('button', { name: 'Hinzufügen' }).click();
    const habit = page.getByRole('checkbox', { name: 'Lesen erledigt' });
    await expect(habit).not.toBeChecked();
    await habit.click();
    await expect(habit).toBeChecked();

    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'Lesen erledigt' })).toBeChecked();
    await expect(page.getByTestId('metric-0')).toContainText(/8['’]421/);
  });

  test('entries show up on the today screen and in the progress review', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Schneller Win').fill('Früh aufgestanden');
    await page.getByRole('button', { name: 'Hinzufügen' }).click();

    await expect(page.getByText('1 Tag in Folge')).toBeVisible();
    await expect(page.getByTestId('tile-wins')).toContainText('1');

    await openTab(page, 'Fortschritt');
    await expect(page.getByTestId('streak-current')).toContainText('1 Tag');
    await expect(page.getByTestId('summary-wins')).toContainText('1');
    await expect(page.getByRole('img', { name: /: 1 Eintrag$/ })).toBeVisible();
  });

  test('the prompt of the day leads to the journal', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Gedanken aufschreiben' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Gedanken' })).toBeVisible();
  });
});

test.describe('settings', () => {
  test.use({ locale: 'de-CH' });

  test('the chosen language applies everywhere and survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Einstellungen öffnen' }).click();

    await page.getByRole('radio', { name: 'Italiano' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Impostazioni' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');

    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Impostazioni' })).toBeVisible();
    await openTab(page, 'Successi');
    await expect(page.getByRole('button', { name: 'Salva successo' })).toBeVisible();
  });

  test('all data can be exported as a JSON file', async ({ page }) => {
    await page.goto('/wins');
    await page.getByLabel('Dein Win').fill('Export testen');
    await page.getByRole('button', { name: 'Win speichern' }).click();
    await expect(page.getByRole('listitem')).toHaveCount(1);

    await page.goto('/settings');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Daten exportieren (JSON)' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^positiv-tracker-\d{4}-\d{2}-\d{2}\.json$/);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const exported = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    expect(exported.app).toBe('positiv-tracker');
    expect(exported.data.wins[0].text).toBe('Export testen');
    await expect(page.getByText('Export erstellt.')).toBeVisible();
  });

  test('all data can be deleted after confirmation', async ({ page }) => {
    await page.goto('/wins');
    await page.getByLabel('Dein Win').fill('Wird gelöscht');
    await page.getByRole('button', { name: 'Win speichern' }).click();
    await expect(page.getByRole('listitem')).toHaveCount(1);

    await page.goto('/settings');
    await page.getByRole('button', { name: 'Alle Daten löschen' }).click();
    await page.getByRole('button', { name: 'Ja, alles löschen' }).click();
    await expect(page.getByText('Alle Daten wurden gelöscht.')).toBeVisible();

    await page.getByRole('button', { name: 'Zurück' }).click();
    await openTab(page, 'Wins');
    await expect(page.getByText('Noch keine Wins')).toBeVisible();
  });
});

test.describe('device language', () => {
  test('an Italian device gets the Italian UI', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'it-CH' });
    const page = await context.newPage();
    await page.goto('/wins');

    await expect(page.getByRole('heading', { level: 1, name: 'Successi' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
    await context.close();
  });

  test('an unsupported device language falls back to English', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'fr-FR' });
    const page = await context.newPage();
    await page.goto('/journal');

    await expect(page.getByRole('heading', { level: 1, name: 'Thoughts' })).toBeVisible();
    await context.close();
  });
});

test.describe('accessibility (WCAG A/AA, automatic checks)', () => {
  /** Läuft im Browser: ein paar Einträge, damit Listen, Heatmap und Diagramm geprüft werden. */
  function seed() {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const createdAt = now.toISOString();
    const prefix = 'positiv-tracker/';
    localStorage.setItem(`${prefix}wins/v1`, JSON.stringify([{ id: 'w', text: 'Went for a walk', category: 'health', day, createdAt }]));
    localStorage.setItem(`${prefix}journal/v1`, JSON.stringify([{ id: 'j', text: 'Good day', mood: 4, day, createdAt }]));
    localStorage.setItem(`${prefix}habits/v1`, JSON.stringify([{ id: 'h', name: 'Read', day, createdAt }]));
    localStorage.setItem(`${prefix}habit-checks/v1`, JSON.stringify([{ id: `h|${day}`, habitId: 'h', day }]));
    localStorage.setItem(
      `${prefix}health/v1`,
      JSON.stringify([{ id: day, day, steps: 8421, sleepHours: 7.5, waterGlasses: 5, trainingMinutes: 30 }]),
    );
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    for (const route of ['', 'wins', 'journal', 'health', 'progress', 'settings']) {
      test(`/${route} has no violations in ${colorScheme} mode`, async ({ browser }) => {
        const context = await browser.newContext({ locale: 'en-GB', colorScheme });
        await context.addInitScript(seed);
        const page = await context.newPage();
        await page.goto(`/${route}`);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

        expect(
          results.violations.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`),
        ).toEqual([]);
        await context.close();
      });
    }
  }
});
