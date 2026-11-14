import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';

import { createDeviceRepositories } from '@/app-data/repositories';
import { setupAppI18n } from '@/i18n/setup-app-i18n';
import { applyWebChrome } from '@/ui/web-chrome';

/**
 * Composition Root: der einzige Ort, an dem die echten Abhängigkeiten gewählt werden.
 * Wer später z. B. auf ein Server-Backend wechselt, tauscht nur hier die Adapter.
 */
export const { i18n } = setupAppI18n({
  deviceLanguageCodes: getLocales().map((locale) => locale.languageCode),
  storage: AsyncStorage,
});

export const repositories = createDeviceRepositories(AsyncStorage);

// Im Web: <html lang="…"> aktuell halten, damit Screenreader die richtige Aussprache wählen.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  applyWebChrome(document);
  document.documentElement.lang = i18n.language;
  i18n.on('languageChanged', (language) => {
    document.documentElement.lang = language;
  });
}
