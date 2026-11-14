import { createInstance, type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE, type Language } from './languages';
import { resources } from './resources';

/**
 * Erstellt eine eigene i18next-Instanz. Eine Factory (statt eines globalen
 * Singletons) hält Tests voneinander unabhängig.
 */
export function createI18n(language: Language): I18n {
  const instance = createInstance();
  instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false }, // React escaped bereits selbst
    initAsync: false, // Ressourcen sind gebündelt → synchron bereit
  });
  return instance;
}
