import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';

import { AsyncStorageWinRepository } from '@/features/wins/data/async-storage-win-repository';
import type { WinRepository } from '@/features/wins/data/win-repository';
import { setupAppI18n } from '@/i18n/setup-app-i18n';

/**
 * Composition Root: der einzige Ort, an dem die echten Abhängigkeiten gewählt werden.
 * Wer später z. B. auf ein Server-Backend wechselt, tauscht nur hier den Adapter.
 */
export const { i18n } = setupAppI18n({
  deviceLanguageCodes: getLocales().map((locale) => locale.languageCode),
  storage: AsyncStorage,
});

export const winRepository: WinRepository = new AsyncStorageWinRepository(AsyncStorage);

// Im Web: <html lang="…"> aktuell halten, damit Screenreader die richtige Aussprache wählen.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
  i18n.on('languageChanged', (language) => {
    document.documentElement.lang = language;
  });
}
