/**
 * Farbpalette des Positiv-Trackers – bewusst im vertrauten Stil etablierter Apps
 * (Apple Health, Streaks, Day One): neutrale System-Flächen, eine Akzentfarbe (Grün)
 * und je eine feste Farbe pro Bereich, damit man Bereiche auf einen Blick erkennt.
 *
 * Komponenten verwenden nur die Namen (z. B. bg="card"), nie feste Farbwerte.
 * Kontrast: Textfarben erfüllen auf ihren Hintergründen WCAG AA (mind. 4.5:1) –
 * der axe-E2E-Test prüft das in beiden Modi.
 */
export const lightPalette = {
  // Flächen
  page: '#F2F2F7', // gruppierter Hintergrund
  card: '#FFFFFF', // Gruppen und Zeilen
  cardAlt: '#E9E9EF', // Eingabefelder, neutrale Knöpfe
  segment: '#FFFFFF', // gewähltes Segment in einer Umschaltleiste
  line: '#D6D6DB', // Trennlinien
  shade: 'rgba(0, 0, 0, 0.12)',
  // Text
  ink: '#1C1C1E',
  muted: '#5F5F66',
  // Akzent (Grün): Hauptknöpfe, Auswahl, erledigt
  brand: '#1B7A37',
  onBrand: '#FFFFFF',
  brandSoft: '#DDF0E2',
  brandInk: '#145C29',
  // Hervorhebung für Serien und Wins
  accent: '#B45309',
  accentSoft: '#FFEFD6',
  accentInk: '#8A4200',
  // Fehler und Löschen
  danger: '#C8102E',
  dangerSoft: '#FCE4E7',
  // Bereichsfarben (Icon-Flächen mit weissem Symbol)
  catWins: '#F08C00',
  catMood: '#5E5CE6',
  catSteps: '#E5352B',
  catSleep: '#2C9AB7',
  catWater: '#0A84FF',
  catTraining: '#28A745',
  catHabits: '#AF52DE',
  catNeutral: '#8E8E93',
  onCat: '#FFFFFF',
  // Stimmung 1 (sehr schlecht) bis 5 (sehr gut)
  mood1: '#FF8A80',
  mood2: '#FFB866',
  mood3: '#FFE066',
  mood4: '#B7E27A',
  mood5: '#6FDB8F',
  onMood: '#1C1C1E',
  // Heatmap: 0 = keine Aktivität … 4 = sehr aktiv
  heat0: '#E4E4EA',
  heat1: '#BFE3C8',
  heat2: '#86CB98',
  heat3: '#3FA35C',
  heat4: '#1B7A37',
} as const;

export const darkPalette: Record<keyof typeof lightPalette, string> = {
  page: '#000000',
  card: '#1C1C1E',
  cardAlt: '#2C2C2E',
  segment: '#636366',
  line: '#38383A',
  shade: 'rgba(0, 0, 0, 0.5)',
  ink: '#F5F5F7',
  muted: '#A1A1A8',
  brand: '#30D158',
  onBrand: '#00260E',
  brandSoft: '#12331C',
  brandInk: '#5EE07F',
  accent: '#FFB340',
  accentSoft: '#3A2606',
  accentInk: '#FFC466',
  danger: '#FF6961',
  dangerSoft: '#3B1214',
  catWins: '#F08C00',
  catMood: '#5E5CE6',
  catSteps: '#E5352B',
  catSleep: '#2C9AB7',
  catWater: '#0A84FF',
  catTraining: '#28A745',
  catHabits: '#AF52DE',
  catNeutral: '#636366',
  onCat: '#FFFFFF',
  mood1: '#FF8A80',
  mood2: '#FFB866',
  mood3: '#FFE066',
  mood4: '#B7E27A',
  mood5: '#6FDB8F',
  onMood: '#1C1C1E',
  heat0: '#2C2C2E',
  heat1: '#14451F',
  heat2: '#1E6B30',
  heat3: '#27994A',
  heat4: '#30D158',
};

export type PaletteColor = keyof typeof lightPalette;
