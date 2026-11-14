import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { AppDataProvider } from '@/app-data/app-data-provider';
import type { Repositories } from '@/app-data/repositories';
import { generateId as defaultGenerateId } from '@/shared/generate-id';
import { tamaguiConfig } from '@/ui/tamagui.config';

type Props = {
  i18n: I18n;
  repositories: Repositories;
  now?: () => Date;
  generateId?: () => string;
  children: ReactNode;
};

const currentDate = () => new Date();

/**
 * Alle app-weiten Provider an einem Ort. Abhängigkeiten (Sprache, Datenquellen, Uhr)
 * kommen von aussen – die App übergibt die echten, Tests übergeben Test-Varianten.
 */
export function AppProviders({ i18n, repositories, now = currentDate, generateId = defaultGenerateId, children }: Props) {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      <I18nextProvider i18n={i18n}>
        <AppDataProvider repositories={repositories} now={now} generateId={generateId}>
          {children}
        </AppDataProvider>
      </I18nextProvider>
    </TamaguiProvider>
  );
}
