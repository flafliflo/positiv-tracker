# Positiv-Tracker

Persönliche App für Wins, Gedanken (Journaling), Gesundheit und Gewohnheiten.
Phase 1: Web-App. Phase 2: iOS und Android aus derselben Codebasis. Später SaaS.

Expo-spezifische Regeln stehen in @AGENTS.md (u. a.: Expo-APIs immer in der
versionierten Doku nachschlagen, `npx expo install` für Expo-Pakete verwenden).

**Zu Beginn jeder Session lesen:** diese Datei, `AGENTS.md` und `docs/decisions/`.

## Stack

| Bereich | Wahl |
| --- | --- |
| Framework | Expo SDK 58, React Native 0.88, React 19, Expo Router (Routen in `src/app/`) |
| Sprache | TypeScript (strict) |
| UI | Tamagui v3 mit Config v6 (`src/ui/tamagui.config.ts`) |
| i18n | i18next + react-i18next, Gerätesprache via expo-localization |
| Speicher | Lokal auf dem Gerät (AsyncStorage / localStorage) hinter `WinRepository` |
| Tests | Jest 30 + jest-expo + React Native Testing Library 14, Playwright + axe (E2E) |
| CI/Hosting | GitHub Actions → GitHub Pages (https://flafliflo.github.io/positiv-tracker/) |

## Befehle

```bash
npm run web          # Dev-Server im Browser (Port 8081)
npm test             # Unit- und Komponenten-Tests
npm run test:watch   # Tests im Watch-Modus (für TDD)
npm run test:e2e     # Web-Build + Playwright-E2E-Tests
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run build:web    # Statischer Web-Build nach dist/
```

Vor jedem Commit müssen `npm run lint`, `npm run typecheck` und `npm test` grün sein.

## Architektur

Feature-Ordner mit drei Schichten. Abhängigkeiten zeigen nur nach innen (ui → data → domain).

```
src/
  app/                 Routen (Expo Router) – nur dünne Hüllen, keine Logik, keine Tests
  composition-root.ts  Einziger Ort, an dem echte Abhängigkeiten gewählt werden
  providers/           AppProviders (Theme, i18n, Repositories)
  features/<feature>/
    domain/            Reines TypeScript: Typen, Validierung, Regeln (kein React/Expo)
    data/              Ports (Interfaces) + Adapter (z. B. AsyncStorage)
    ui/                Komponenten und Screens
  i18n/                Sprachen, Übersetzungen (locales/*.json), Formatierung
  ui/                  Design-System-Konfiguration
  test-utils/          renderWithProviders
e2e/                   Playwright-Tests
docs/decisions/        Architekturentscheide (ADR)
docs/research/         Recherche (Feature-Ideen)
```

- **Adapter-Pattern:** Die UI kennt nur Interfaces (`WinRepository`). Adapter werden im
  Composition Root gewählt und per React Context verteilt. Neue Datenquellen
  (Backend, HealthKit, Health Connect, manuelle Eingabe) kommen als weitere Adapter dazu.
- **Vertragstests:** Jeder Adapter eines Ports läuft durch denselben Test
  (`win-repository.test.ts`), damit sich alle gleich verhalten.
- **Zeit und IDs injizieren:** `now` und `generateId` werden übergeben, nie direkt
  `new Date()` in Domänenlogik – sonst sind Tests nicht deterministisch.

## Konventionen

- **TDD ist Pflicht:** zuerst ein fehlschlagender Test, dann minimaler Code, dann Refactoring.
  Kein Produktionscode ohne vorherigen roten Test.
- **Keine hartcodierten UI-Texte.** Jeder Text kommt aus `src/i18n/locales/{de,it,en}.json`.
  Ein Test erzwingt, dass jeder Key in allen drei Sprachen existiert.
- **Datum/Zahlen** nur über `formatDay` / `formatNumber` (`src/i18n/format.ts`).
- **Tests** liegen in `__tests__/` neben dem Code, nie in `src/app/`.
  Komponenten über `renderWithProviders` rendern und über Rolle/Label abfragen
  (so wie ein Mensch oder Screenreader die UI benutzt), nicht über Implementierungsdetails.
- **Tamagui v3:** Tokens ohne `$` (`bg="background"`, `gap="4"`, `color="color-9"`),
  nur Kurzformen (`p`, `px`, `bg`, `rounded`, `items`, `justify`, `maxW`),
  Button/Input-Grössen `xs|sm|md|lg|xl`, Input mit `onChange={(e) => e.target.value}`.
- **Barrierefreiheit:** `role` und `aria-*`-Props setzen; der axe-E2E-Test muss grün bleiben.
- **Commits:** kleine Schritte, Conventional Commits (`feat(wins): …`, `test: …`, `chore: …`),
  ein Feature pro Commit, Tests im selben Commit.
- **Kommentare und Doku auf Deutsch, Code-Bezeichner und Commits auf Englisch.**
- **Grosse Entscheide** (Stack, Datenbank, Design, kostenpflichtige Dienste) zuerst mit
  Flavio klären und als ADR in `docs/decisions/` festhalten.

## Arbeitsweise mit KI

Superpowers-Workflow (obra/superpowers): Brainstorming → Plan → TDD → Review.
Das Projekt ist auch ein Lernprojekt: Entscheidungen immer kurz begründen.

## Stand

- Fertig: Projekt-Setup, i18n (de/it/en), Sprachwahl, Feature „Win erfassen und anzeigen", CI + Deploy.
- Offen (Entscheid nötig): Backend/Datenbank + Login (siehe ADR 0003), Branding/Farben.
- Bekannte Lücken: noch keine Animationen (Tamagui-Animationstreiber fehlt), kein Bearbeiten/Löschen
  von Wins, kein Export, Safe-Area-Abstände für native Geräte.
