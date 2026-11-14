# ADR 0004: GitHub Pages als Web-Hosting (Single-Page-App)

- Status: akzeptiert (Entscheid von Flavio)
- Datum: 2026-11-14

## Kontext

Die Web-App soll von Anfang an live sein, alles soll über GitHub laufen und nichts kosten.

## Entscheid

- Öffentliches Repository, Deploy über GitHub Actions auf GitHub Pages.
- Expo-Web-Output `single` (Single-Page-App): ein `index.html`, Routing im Browser.
- Der Unterpfad des Repos kommt über `EXPO_BASE_URL` in `app.config.ts`
  (`experiments.baseUrl`), lokal bleibt er leer.
- `404.html` ist eine Kopie von `index.html`, damit auch direkte Links auf Unterseiten funktionieren.
- Deploy nur, wenn Lint, Typecheck, Unit-, Komponenten- und E2E-Tests grün sind.

## Begründung

- Gratis, kein zusätzliches Konto, Code und Hosting am selben Ort.
- `single` statt `static`/`server`: Die App liegt später hinter einem Login, SEO spielt keine
  Rolle, und es gibt keinen Server-Code. `server` (Standard im Template) braucht einen Server.

## Konsequenzen

- Der Quellcode ist öffentlich (GitHub Pages aus privaten Repos ist kostenpflichtig).
  Geheimnisse (API-Keys) gehören nie ins Repo.
- GitHub Pages kann keinen Server-Code ausführen. Sobald Server-Funktionen nötig sind
  (z. B. API-Routen), braucht es einen anderen Host (EAS Hosting, Cloudflare, Vercel).
- `experiments.baseUrl` ist bei Expo als experimentell markiert.
