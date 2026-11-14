import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { WinsScreen } from '@/features/wins/ui/wins-screen';

/** Route "/": Dateien in src/app sind nur dünne Hüllen, die Logik liegt in src/features. */
export default function HomeRoute() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('app.name') }} />
      <WinsScreen />
    </>
  );
}
