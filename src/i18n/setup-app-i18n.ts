import type { i18n as I18n } from 'i18next';

import { createI18n } from './i18n';
import { isSupportedLanguage, resolveLanguage } from './languages';

export const LANGUAGE_STORAGE_KEY = 'positiv-tracker/settings/language';

type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

type Options = {
  deviceLanguageCodes: readonly (string | null | undefined)[];
  storage: Storage;
};

/**
 * Startet i18n für die App:
 * 1. sofort in der Gerätesprache (kein Warten, kein Flackern),
 * 2. wechselt auf die früher gewählte Sprache, sobald der Speicher gelesen ist,
 * 3. merkt sich jeden späteren Sprachwechsel.
 */
export function setupAppI18n({ deviceLanguageCodes, storage }: Options): {
  i18n: I18n;
  ready: Promise<void>;
} {
  const i18n = createI18n(resolveLanguage(deviceLanguageCodes));

  const ready = storage
    .getItem(LANGUAGE_STORAGE_KEY)
    .then(async (stored) => {
      if (isSupportedLanguage(stored) && stored !== i18n.language) {
        await i18n.changeLanguage(stored);
      }
    })
    .catch(() => {
      // Speicher nicht verfügbar (z. B. privater Modus): Gerätesprache bleibt aktiv.
    })
    .then(() => {
      i18n.on('languageChanged', (language) => {
        storage.setItem(LANGUAGE_STORAGE_KEY, language).catch(() => {});
      });
    });

  return { i18n, ready };
}
