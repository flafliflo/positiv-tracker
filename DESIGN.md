---
name: Positiv-Tracker
description: Klassischer App-Standard – gruppierte Listen, eine Akzentfarbe, farbige Bereichs-Icons.
---

# Design-System

Quelle der Wahrheit im Code: `src/ui/palette.ts` (Farben), `src/ui/kit.tsx` (Bausteine),
`src/ui/tab-bar.tsx` (Navigation), `src/ui/web-chrome.ts` (Browser-Flächen).
Entscheid und Begründung: `docs/decisions/0007-eigenes-design-system-auf-tamagui.md`.

## Richtung

Der vertraute Aufbau etablierter Apps (Apple Health, Streaks, Day One), ohne eigenes Bildthema.
Die Qualität zeigt sich in Ausrichtung, Abständen, Schriftstufen und sauberen Zuständen.

## Farben

| Rolle | Hell | Dunkel | Einsatz |
| --- | --- | --- | --- |
| page | #F2F2F7 | #000000 | Seitenhintergrund |
| card | #FFFFFF | #1C1C1E | Gruppen, Zeilen, Tab-Leiste |
| cardAlt | #E9E9EF | #2C2C2E | Eingabefelder, neutrale Knöpfe |
| line | #D6D6DB | #38383A | Trennlinien |
| ink | #1C1C1E | #F5F5F7 | Haupttext |
| muted | #5F5F66 | #A1A1A8 | Nebentext |
| brand | #1B7A37 | #30D158 | Hauptknöpfe, Auswahl, erledigt, aktiver Tab |
| accent | #B45309 | #FFB340 | Serien |
| danger | #C8102E | #FF6961 | Fehler, Löschen |

Bereichsfarben (Icon-Fläche mit weissem Symbol): Wins Orange, Stimmung Indigo, Schritte Rot,
Schlaf Türkis, Wasser Blau, Training Grün, Gewohnheiten Violett. Jede Farbe gehört fest zu
einem Bereich und kommt nur dort vor.

Stimmung 1–5: Rot, Orange, Gelb, Hellgrün, Grün – jeweils mit dunklem Symbol.
Heatmap: fünf Stufen vom neutralen Grau zum Akzent-Grün.

## Schrift

System-Schrift des Geräts. Stufen: 34/800 Seitentitel, 20/700 Abschnitt und Kernaussage,
17 Fliesstext und Listenzeilen (600 für Werte), 15 Nebentext und kleine Knöpfe,
13 Fussnoten und Feld-Beschriftungen, 11 Tab-Beschriftung. Ziffern sind gleich breit.

## Formen und Abstände

- Radius: 14 Gruppen und Karten, 12 grosse Knöpfe, 10 Felder, volle Rundung für kleine Knöpfe.
- Seitenrand 16, Abstand zwischen Abschnitten 28, Überschrift zu Inhalt 10, Zeilenhöhe mind. 52.
- Keine Schatten auf Flächen, keine Rahmen um Gruppen – der Hintergrund trennt.

## Bausteine

- **Group + Row / ValueRow**: gruppierte Liste mit Trennlinien; „Bezeichnung … Wert" mit Bereichs-Icon.
- **Section**: Abschnitt mit Überschrift, optional mit Umschaltleiste rechts.
- **Card**: Fläche für Formulare und freie Inhalte.
- **AppButton**: primary (gefüllt), soft (getönt), ghost (neutral), danger; Grössen md und sm.
- **Chip**: Auswahl-Pille (Kategorien). **Segmented/Segment**: Umschaltleiste (Zeitraum, Sprache).
- **IconButton**, **IconChip**, **TextField**, **TextAreaField**, **ErrorMessage**, **EmptyState**, **Footnote**.
- **TabBar**: fünf Tabs über die volle Breite, aktiver Tab in Akzentfarbe.

## Icons

Eine Familie für alles: Material Community Icons (`@expo/vector-icons`). Keine Emojis.

## Bewegung und Zustände

Kurze Übergänge (Tamagui `transition="quick"`): Drücken dimmt, Auswahl skaliert leicht.
Jeder klickbare Baustein hat Hover, Druck, sichtbaren Tastatur-Fokus (3px Akzent-Ring) und
einen festen Namen für Screenreader.

## Regeln

- Farben nur über Palettennamen, nie feste Werte in Screens.
- Keine Karten in Karten; Listen sind Gruppen mit Zeilen.
- Löschen fragt immer nach.
- Kontrast mind. 4.5:1 für Text – der axe-E2E-Test prüft alle Seiten in Hell und Dunkel.
