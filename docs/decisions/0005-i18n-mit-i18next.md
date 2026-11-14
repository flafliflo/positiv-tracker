# ADR 0005: Mehrsprachigkeit mit i18next

- Status: akzeptiert
- Datum: 2026-11-14

## Kontext

Deutsch, Italienisch und Englisch von Tag 1. Keine hartcodierten Texte, Sprache automatisch
vom Gerät, in der App umschaltbar, Datum und Zahlen pro Sprache formatiert.

## Entscheid

- i18next + react-i18next, Übersetzungen als JSON pro Sprache in `src/i18n/locales/`.
- Gerätesprache über `expo-localization` (`getLocales()`), Rückfall auf Englisch.
- Reihenfolge: gespeicherte Wahl > Gerätesprache > Englisch (`resolveLanguage`).
- Formatierung über die eingebaute `Intl`-API, mit Schweizer Varianten für Deutsch und
  Italienisch (`de-CH`, `it-CH`, z. B. 10’000) und `en-GB` für Englisch.
- i18n wird über eine Factory (`createI18n`) erzeugt statt als globales Singleton.

## Begründung

- i18next ist der De-facto-Standard, funktioniert identisch auf Web und nativ und
  beherrscht Interpolation und Pluralformen.
- Die Factory hält Tests unabhängig voneinander: jeder Test bekommt seine eigene Instanz.
- Die Übersetzungen sind klein und werden mitgebündelt → synchron verfügbar, kein Flackern.

## Absicherung durch Tests

- `locales.test.ts`: Jeder Key existiert in allen drei Sprachen und ist nicht leer.
- Komponenten- und E2E-Tests prüfen das Feature in allen drei Sprachen.

## Konsequenzen

- Bei vielen Sprachen/Texten müsste man Übersetzungen später nachladen statt bündeln.
- Formatierung richtet sich aktuell nach der App-Sprache, nicht nach der Region des Geräts.
