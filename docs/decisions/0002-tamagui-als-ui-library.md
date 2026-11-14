# ADR 0002: Tamagui als UI-Library

- Status: akzeptiert (Entscheid von Flavio)
- Datum: 2026-11-14

## Kontext

Gesucht war ein modernes, aktiv gepflegtes Design-System, das mit Expo auf Web, iOS und
Android läuft, Dark Mode unterstützt und barrierefreie Komponenten liefert.

## Optionen

| Option | Vorteile | Nachteile |
| --- | --- | --- |
| NativeWind + React Native Reusables | Tailwind-Klassen, Komponenten als eigener Quellcode, volle Kontrolle | Komponenten selbst pflegen |
| gluestack-ui v3 | viele fertige Komponenten, starke Accessibility | mehr Abhängigkeiten, generischerer Look |
| **Tamagui** | komplettes Design-System, Themes, optionaler optimierender Compiler | steilste Lernkurve, eigene Styling-Sprache |

## Entscheid

Tamagui v3 mit der Standard-Konfiguration v6 (`@tamagui/config/v6`), vorerst ohne Compiler.

## Konsequenzen

- v3 nutzt ein web-nahes Prop-Modell: Tokens ohne `$`, nur Kurzformen, `aria-*`/`role`
  statt `accessibility*`. Viele Beispiele im Netz sind noch v1 und passen nicht mehr.
- In Jest braucht ein ESM-only-Modul von Tamagui ein Mapping auf den CommonJS-Build
  (`moduleNameMapper` in `package.json`).
- Der Compiler (CSS-Extraktion) ist optional und wird erst für die Produktion relevant.
- Noch offen: Animationstreiber einrichten und Farben/Schrift ans eigene Branding anpassen.
