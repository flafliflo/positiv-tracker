import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { WinRepositoryProvider } from '@/features/wins/data/win-repository-context';
import type { WinRepository } from '@/features/wins/data/win-repository';
import { tamaguiConfig } from '@/ui/tamagui.config';

type Props = {
  i18n: I18n;
  winRepository: WinRepository;
  children: ReactNode;
};

/**
 * Alle app-weiten Provider an einem Ort. Abhängigkeiten (Sprache, Datenquelle)
 * kommen von aussen – die App übergibt die echten, Tests übergeben Test-Varianten.
 */
export function AppProviders({ i18n, winRepository, children }: Props) {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      <I18nextProvider i18n={i18n}>
        <WinRepositoryProvider value={winRepository}>{children}</WinRepositoryProvider>
      </I18nextProvider>
    </TamaguiProvider>
  );
}
