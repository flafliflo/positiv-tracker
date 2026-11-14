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
| Speicher | Lokal auf dem Gerät (AsyncStorage / localStorage) hinter dem Port `Collection<T>` |
| Icons | Ionicons aus `@expo/vector-icons`, Emojis für Kategorien und Stimmung |
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
                       index (Heute), wins, journal, health, progress, settings; _layout = Tab-Leiste
  composition-root.ts  Einziger Ort, an dem echte Abhängigkeiten gewählt werden
  providers/           AppProviders (Theme, i18n, App-Daten)
  app-data/            AppDataProvider (alle Daten + Aktionen), Repositories, Export/Löschen
  data/                Port Collection<T> + Adapter (AsyncStorage, In-Memory)
  features/<feature>/  wins, journal, health, habits, progress, today, settings
    domain/            Reines TypeScript: Typen, Validierung, Regeln (kein React/Expo)
    data/              Feature-spezifische Ports/Adapter (z. B. StepsSource)
    ui/                Komponenten und Screens
  i18n/                Sprachen, Übersetzungen (locales/*.json), Formatierung
  shared/              Kalendertag-Helfer, ID-Erzeugung
  ui/                  Design-System: palette.ts, tamagui.config.ts, kit.tsx, tab-bar.tsx
  test-utils/          renderWithProviders (fester Testzeitpunkt, IDs id-1, id-2, …)
e2e/                   Playwright-Tests
scripts/               screenshots.mjs (Screenshots aller Seiten mit Beispieldaten)
docs/decisions/        Architekturentscheide (ADR)
docs/research/         Recherche (Feature-Ideen)
```

- **Datenfluss:** Screens lesen und ändern Daten nur über `useAppData()`. Der Provider
  validiert über die Domäne, schreibt ins Repository und aktualisiert erst dann den Zustand.
  Aktionen geben `{ ok: true }` oder `{ ok: false, error }` zurück; `error` ist ein Übersetzungs-Key.
- **Adapter-Pattern:** Die App kennt nur Interfaces (`Collection<T>`, `StepsSource`). Adapter werden
  im Composition Root gewählt. Neue Datenquellen (Backend, HealthKit, Health Connect) kommen
  als weitere Adapter dazu.
- **Vertragstests:** Jeder Adapter eines Ports läuft durch denselben Test (`collection.test.ts`).
- **Zeit und IDs injizieren:** `now` und `generateId` werden übergeben, nie direkt
  `new Date()` in Domänenlogik – sonst sind Tests nicht deterministisch.
- **Tage statt Zeitstempel:** Streaks, Heatmap und Rückblick rechnen mit lokalen Kalendertagen
  (`YYYY-MM-DD`, `src/shared/day.ts`).

## Konventionen

- **TDD ist Pflicht:** zuerst ein fehlschlagender Test, dann minimaler Code, dann Refactoring.
  Kein Produktionscode ohne vorherigen roten Test.
- **Keine hartcodierten UI-Texte.** Jeder Text kommt aus `src/i18n/locales/{de,it,en}.json`.
  Ein Test erzwingt, dass jeder Key in allen drei Sprachen existiert.
- **Datum/Zahlen** nur über `formatDay` / `formatNumber` (`src/i18n/format.ts`).
- **Tests** liegen in `__tests__/` neben dem Code, nie in `src/app/`.
  Komponenten über `renderWithProviders` rendern und über Rolle/Label abfragen
  (so wie ein Mensch oder Screenreader die UI benutzt), nicht über Implementierungsdetails.
- **Tamagui v3:** Tokens ohne `$` (`bg="card"`, `gap="4"`, `color="muted"`), nur Kurzformen
  (`p`, `px`, `bg`, `rounded`, `items`, `justify`, `maxW`, `w`, `h`). Zustände stehen als Präfix im Wert:
  `opacity="hover:0.9 press:0.8"`, `outlineWidth="focus-visible:3px"`, `cursor="web:pointer"`.
  Input mit `onChange={(e) => e.target.value}`. Kein numerisches `lineHeight` (wäre ein Multiplikator).
- **Design:** Farben nur über die Namen aus `src/ui/palette.ts`, Bausteine aus `src/ui/kit.tsx`
  (Screen, Card, AppButton, Chip, IconButton, TextField, StatTile, ErrorMessage, EmptyState).
  Nach Design-Änderungen `node scripts/screenshots.mjs` laufen lassen und hell + dunkel ansehen.
- **Klickbares** braucht einen festen Namen (`aria-label`), sonst lesen Screenreader Icons/Emojis mit vor.
  `role="alert"` gehört auf ein Text-Element (nativ sind nur Texte/Buttons „accessible").
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

- Fertig (Web, lokal gespeichert): Heute-Ansicht, Wins (erfassen/bearbeiten/löschen), Gedanken mit
  Stimmung 1–5, Gesundheit (Schritte, Schlaf, Wasser, Training), Gewohnheiten mit Serien,
  Fortschritt (Streaks, Heatmap, Rückblick 7/30 Tage, Stimmungsverlauf, Schritte↔Stimmung),
  Einstellungen (Sprache, JSON-Export, alles löschen), Tab-Navigation, Dark Mode, CI + Deploy.
- Offen (Entscheid von Flavio nötig): Backend/Datenbank + Login + Sync (siehe ADR 0003),
  Verschlüsselung sensibler Felder, KI-Wochenrückblick (kostenpflichtiger Dienst).
- Bekannte Lücken: Einträge nur für heute erfassbar (kein Nachtragen für frühere Tage),
  keine Erinnerungen, keine Widgets, HealthKit/Health Connect erst in Phase 2 (Port `StepsSource`
  existiert), native Apps noch nicht gebaut/getestet, Safe-Area-Abstände für native Geräte.
