import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { createInMemoryRepositories, type Repositories } from '@/app-data/repositories';
import type { AppData } from '@/features/progress/domain/stats';
import { createI18n } from '@/i18n/i18n';
import type { Language } from '@/i18n/languages';
import { AppProviders } from '@/providers/app-providers';

type Options = {
  language?: Language;
  /** Startdaten für die In-Memory-Repositories. */
  seed?: Partial<AppData>;
  /** Eigene Repositories, z. B. um Speicherfehler zu simulieren. */
  repositories?: Repositories;
  now?: () => Date;
};

/** Fester Testzeitpunkt: Sonntag, 15. November 2026, 09:00 Ortszeit. */
export const TEST_NOW = () => new Date(2026, 10, 15, 9, 0);
export const TEST_TODAY = '2026-11-15';

/** Rendert eine Komponente mit denselben Providern wie die echte App. IDs sind id-1, id-2, … */
export async function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const i18n = createI18n(options.language ?? 'en');
  const repositories = options.repositories ?? createInMemoryRepositories(options.seed);
  let nextId = 1;

  const view = await render(
    <AppProviders
      i18n={i18n}
      repositories={repositories}
      now={options.now ?? TEST_NOW}
      generateId={() => `id-${nextId++}`}
    >
      {ui}
    </AppProviders>,
  );

  return { ...view, i18n, repositories };
}
