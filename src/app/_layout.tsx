import { Stack } from 'expo-router';

import { i18n, winRepository } from '@/composition-root';
import { AppProviders } from '@/providers/app-providers';

export default function RootLayout() {
  return (
    <AppProviders i18n={i18n} winRepository={winRepository}>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
