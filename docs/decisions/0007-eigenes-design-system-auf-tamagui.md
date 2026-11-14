# ADR 0007: Eigenes Design-System auf Tamagui, im klassischen App-Stil

- Status: akzeptiert (Richtung von Flavio gewählt)
- Datum: 2026-11-15

## Kontext

Die erste Version nutzte die Standard-Komponenten von Tamagui und wirkte generisch.
Eine zweite Version mit Emojis, Kachel-Raster und schwebender Tab-Leiste wirkte wie
„von KI gebaut". Für das Redesign wurde der Design-Skill „impeccable"
(github.com/pbakaus/impeccable) geprüft, installiert und angewendet.

## Zur Wahl standen

1. Wegweiser (Signalgelb/Schwarz wie Schweizer Wanderwegweiser)
2. Abreisskalender (Weiss/Schwarz/Rot, grosse Datumszahl)
3. Stempelkarte (Tannengrün, Stempel pro aktivem Tag)
4. **Klassisch wie bekannte Apps** ← gewählt

## Entscheid

Der vertraute Standard etablierter Apps (Apple Health, Streaks, Day One), sauber umgesetzt.
Tamagui bleibt die technische Basis; darauf liegt eine eigene Schicht:

- `src/ui/palette.ts`: neutrale System-Flächen, Grün als Akzent, feste Farbe pro Bereich.
- `src/ui/kit.tsx`: Bausteine (Screen, Section, Group/Row/ValueRow, Card, AppButton, Chip,
  Segmented, IconButton, IconChip, TextField, ErrorMessage, EmptyState).
- `src/ui/tab-bar.tsx`: klassische Tab-Leiste über die volle Breite, im Web echte Links.
- `src/ui/web-chrome.ts`: Textauswahl, Schreibmarke und Scrollbalken in App-Farben.
- Icons: eine Familie (Material Community Icons). Keine Emojis.
- Schrift: System-Schrift des Geräts mit klaren Stufen (34 / 20 / 17 / 15 / 13 / 11).

Details stehen in `DESIGN.md`, der Produktkontext in `PRODUCT.md`.

## Begründung

- Vertraute Muster brauchen keine Erklärung: gruppierte Listen, Umschaltleisten und eine
  Tab-Leiste kennt jede Person vom eigenen Handy.
- Gruppierte Listen statt Kachel-Raster: mehr Information pro Bildschirm, ruhiger, besser lesbar.
- Eine Icon-Familie statt Emojis: einheitliche Strichstärke, auf jedem Gerät gleich.
- Feste Bereichsfarben erfüllen eine Aufgabe: Man erkennt Schlaf, Wasser oder Wins ohne zu lesen.
- System-Schrift: keine Ladezeit, kein Abruf bei Dritten (Datenschutz), passt zum klassischen Stil.

## Konsequenzen

- Die App ist weniger eigenständig als mit einem eigenen Bildthema – bewusst so gewählt.
- Vom Skill wurden nur die Anleitungen (Markdown) installiert. Sein Startskript lädt ein
  Programm aus dem Netz nach und wurde weggelassen; die automatische Richtungs-Auswahl und der
  eingebaute Slop-Detektor liefen deshalb nicht. Geprüft wurde stattdessen von Hand mit
  Screenshots und dem axe-Test.
- Der CSS-Animationstreiber ist fürs Web gedacht; für die nativen Apps (Phase 2) muss ein
  nativer Treiber (Reanimated) konfiguriert und geprüft werden.
- Nach Design-Änderungen `node scripts/screenshots.mjs` ausführen und hell + dunkel ansehen.
