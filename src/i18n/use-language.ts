import { useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE, isSupportedLanguage, type Language } from './languages';

/** Aktive App-Sprache als typsicherer Wert (für Datums-/Zahlenformatierung). */
export function useLanguage(): Language {
  const { i18n } = useTranslation();
  return isSupportedLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;
}
