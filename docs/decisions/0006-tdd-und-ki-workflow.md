# ADR 0006: Teststrategie (TDD) und KI-Workflow

- Status: akzeptiert
- Datum: 2026-11-14

## Kontext

TDD ist Pflicht (Red → Green → Refactor). Entwickelt wird zusammen mit Claude Code.

## Entscheid: Testpyramide

| Ebene | Werkzeug | Was |
| --- | --- | --- |
| Unit | Jest | Domänenlogik, i18n, Formatierung, Adapter (inkl. Vertragstests) |
| Komponenten | React Native Testing Library | Screens mit echten Providern, Abfragen über Rolle/Label |
| E2E | Playwright + axe | Echter Web-Build im Browser (Desktop + Mobil), Barrierefreiheit |

- Tests laufen in CI bei jedem Push; ohne grüne Tests kein Deploy.
- Komponenten-Tests laufen mit `jest-expo` in der nativen Umgebung, E2E deckt das Web ab.

## Entscheid: KI-Workflow

Superpowers (obra/superpowers) als Arbeitsweise: Brainstorming → Plan → TDD → Review.

- Passt, weil es TDD als festen Schritt erzwingt und grosse Aufgaben in kleine,
  überprüfbare Schritte zerlegt.
- `CLAUDE.md` + `docs/decisions/` sind das Projektgedächtnis und werden aktuell gehalten.

## Konsequenzen

- E2E-Tests für native Apps (z. B. Maestro) kommen erst in Phase 2 dazu.
- Der axe-Test findet nur automatisch erkennbare Probleme – manuelle Prüfung
  (Tastatur, Screenreader) bleibt nötig.
