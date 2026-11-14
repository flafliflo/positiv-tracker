# ADR 0007: Eigenes Design-System auf Tamagui

- Status: akzeptiert
- Datum: 2026-11-15

## Kontext

Die erste Version nutzte die Standard-Komponenten und -Farben von Tamagui. Das Ergebnis
wirkte generisch (graue Flächen, blasse Buttons) und passte nicht zu einer positiven,
hochwertigen App.

## Entscheid

Tamagui bleibt die technische Basis (Layout, Themes, Tokens, Animationen). Darauf liegt
eine kleine eigene Schicht:

- `src/ui/palette.ts`: eigene Farbpalette für Hell und Dunkel
  (warmes Papierweiss, Smaragdgrün als Markenfarbe, Bernstein für Wins/Streaks,
  eigene Farbstufen für Stimmung und Heatmap).
- `src/ui/kit.tsx`: eigene Bausteine (Screen, Card, AppButton, Chip, IconButton, TextField,
  StatTile, ErrorMessage, EmptyState) – Screens verwenden nur diese.
- `src/ui/tab-bar.tsx`: schwebende Tab-Leiste, im Web echte Links.
- Icons: Ionicons (`@expo/vector-icons`); Emojis für Kategorien, Stimmung und Kennzahlen.
- Schrift: System-Schrift des Geräts (San Francisco, Roboto, Segoe UI) mit kräftigen Titeln.
- Animationen: Tamagui-CSS-Treiber (`transition="quick"`, Druck- und Hover-Zustände).

## Begründung

- Ein Ort für Farben und Bausteine: Änderungen am Aussehen betreffen eine Datei, nicht jeden Screen.
- Eigene Buttons statt der Tamagui-Skins, weil deren Akzentfarben im hellen Modus zu wenig
  Kontrast hatten. Die eigenen sind im Web echte `<button>`-Elemente mit festem Namen.
- System-Schrift statt Web-Font: keine Ladezeit, kein Abruf bei Dritten (Datenschutz),
  sieht auf jedem Gerät „zu Hause" aus.
- Emojis brauchen keine zusätzliche Bibliothek und funktionieren auf allen Plattformen.

## Konsequenzen

- Emojis sehen je nach Betriebssystem leicht anders aus.
- Der CSS-Animationstreiber ist fürs Web gedacht; für die nativen Apps (Phase 2) muss ein
  nativer Treiber (Reanimated) konfiguriert und geprüft werden.
- Kontrast wird automatisch geprüft: Der axe-E2E-Test läuft über alle Seiten in Hell und Dunkel.
  Nach Design-Änderungen zusätzlich `node scripts/screenshots.mjs` ausführen und ansehen.
