import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { InMemoryWinRepository } from '@/features/wins/data/in-memory-win-repository';
import type { WinRepository } from '@/features/wins/data/win-repository';
import { createI18n } from '@/i18n/i18n';
import type { Language } from '@/i18n/languages';
import { AppProviders } from '@/providers/app-providers';

type Options = {
  language?: Language;
  winRepository?: WinRepository;
};

/** Rendert eine Komponente mit denselben Providern wie die echte App. */
export async function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const i18n = createI18n(options.language ?? 'en');
  const winRepository = options.winRepository ?? new InMemoryWinRepository();

  const view = await render(
    <AppProviders i18n={i18n} winRepository={winRepository}>
      {ui}
    </AppProviders>,
  );

  return { ...view, i18n, winRepository };
}
