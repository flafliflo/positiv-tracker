/**
 * Erstellt Screenshots aller Seiten mit Beispieldaten (hell + dunkel, Handy-Breite).
 * Aufruf: npm run build:web && npx serve dist --single --listen 4173  (in einem Terminal)
 *         node scripts/screenshots.mjs <ausgabe-ordner>              (in einem zweiten)
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2] ?? 'screenshots';
const baseUrl = process.env.BASE_URL ?? 'http://localhost:4173';
const routes = ['', 'wins', 'journal', 'health', 'progress', 'settings'];

/** Läuft im Browser: füllt den lokalen Speicher mit Beispieldaten der letzten 24 Tage. */
function seed() {
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const day = (back) => {
    const d = new Date();
    d.setDate(d.getDate() - back);
    return iso(d);
  };
  const texts = ['10 km gelaufen', 'Prüfung bestanden', 'Früh aufgestanden', 'Gesund gekocht', 'Freund angerufen', '30 Seiten gelesen'];
  const categories = ['health', 'learning', 'mindset', 'health', 'relationships', 'learning'];
  const wins = [];
  const journal = [];
  const health = [];
  const checks = [];
  for (let i = 0; i < 24; i++) {
    if (i === 9 || i === 10 || i === 17) continue;
    const d = day(i);
    for (let k = 0; k < (i % 3) + 1; k++) {
      wins.push({ id: `w${i}-${k}`, text: texts[(i + k) % 6], category: categories[(i + k) % 6], day: d, createdAt: `${d}T1${k}:00:00.000Z` });
    }
    const steps = [11200, 4300, 9100, 2500, 12800, 6100, 8700][i % 7];
    const mood = steps >= 8000 ? (i % 2 ? 5 : 4) : i % 2 ? 3 : 2;
    journal.push({ id: `j${i}`, text: i % 2 ? 'Guter Tag, viel geschafft.' : '', mood, day: d, createdAt: `${d}T20:00:00.000Z` });
    health.push({ id: d, day: d, steps, sleepHours: 6.5 + (i % 4) * 0.5, waterGlasses: 4 + (i % 5), trainingMinutes: i % 2 ? 30 : null });
    if (i % 4 !== 3) checks.push({ id: `h1|${d}`, habitId: 'h1', day: d });
    if (i % 2 === 0) checks.push({ id: `h2|${d}`, habitId: 'h2', day: d });
  }
  const habits = [
    { id: 'h1', name: '10 Minuten lesen', day: day(24), createdAt: `${day(24)}T08:00:00.000Z` },
    { id: 'h2', name: 'Meditieren', day: day(24), createdAt: `${day(24)}T08:00:00.000Z` },
  ];
  const prefix = 'positiv-tracker/';
  localStorage.setItem(`${prefix}wins/v1`, JSON.stringify(wins));
  localStorage.setItem(`${prefix}journal/v1`, JSON.stringify(journal));
  localStorage.setItem(`${prefix}health/v1`, JSON.stringify(health));
  localStorage.setItem(`${prefix}habits/v1`, JSON.stringify(habits));
  localStorage.setItem(`${prefix}habit-checks/v1`, JSON.stringify(checks));
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();

for (const colorScheme of ['light', 'dark']) {
  const context = await browser.newContext({
    viewport: { width: 430, height: 900 },
    deviceScaleFactor: 1,
    locale: 'de-CH',
    colorScheme,
  });
  await context.addInitScript(seed);
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(`${baseUrl}/${route}`);
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(outDir, `${colorScheme}-${route || 'today'}.png`) });
  }
  await context.close();
}

await browser.close();
console.log(`Screenshots gespeichert in ${outDir}`);
