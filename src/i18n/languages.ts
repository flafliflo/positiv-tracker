export const SUPPORTED_LANGUAGES = ['de', 'it', 'en'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

export function isSupportedLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language);
}

/**
 * Bestimmt die App-Sprache: gespeicherte Wahl des Nutzers > erste unterstützte
 * Gerätesprache > Englisch.
 */
export function resolveLanguage(
  deviceLanguageCodes: readonly (string | null | undefined)[],
  storedChoice?: string | null,
): Language {
  if (isSupportedLanguage(storedChoice)) return storedChoice;
  return deviceLanguageCodes.find(isSupportedLanguage) ?? DEFAULT_LANGUAGE;
}
