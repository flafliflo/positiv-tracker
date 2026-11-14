/**
 * Farbpalette des Positiv-Trackers. Jede Farbe hat eine helle und eine dunkle Variante;
 * Komponenten verwenden nur die Namen (z. B. bg="card"), nie feste Farbwerte.
 *
 * Kontrast: Textfarben erfüllen auf ihren Hintergründen WCAG AA (mind. 4.5:1) –
 * der axe-E2E-Test prüft das in beiden Modi.
 */
export const lightPalette = {
  page: '#F7F5F0', // warmes Papierweiss als Seitenhintergrund
  card: '#FFFFFF',
  cardAlt: '#EFECE5', // Eingabefelder, neutrale Chips
  ink: '#1A1C20', // Haupttext
  muted: '#5B6370', // Nebentext
  line: '#E4DFD5',
  brand: '#047857', // Smaragdgrün: Wachstum, Positives
  onBrand: '#FFFFFF',
  brandSoft: '#D7F2E5',
  brandInk: '#065F46',
  accent: '#B45309', // Bernstein: Streaks und Wins
  accentSoft: '#FDEFC8',
  accentInk: '#92400E',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
  mood1: '#FECACA',
  mood2: '#FED7AA',
  mood3: '#FEF08A',
  mood4: '#D9F99D',
  mood5: '#A7F3D0',
  heat0: '#E9E5DC',
  heat1: '#BDE7D3',
  heat2: '#7AD0AB',
  heat3: '#2FAE7C',
  heat4: '#047857',
  shade: 'rgba(26, 28, 32, 0.08)',
} as const;

export const darkPalette: Record<keyof typeof lightPalette, string> = {
  page: '#0E1014',
  card: '#181B21',
  cardAlt: '#232830',
  ink: '#F2F3F5',
  muted: '#A0A7B4',
  line: '#2C313B',
  brand: '#34D399',
  onBrand: '#052E21',
  brandSoft: '#103A2C',
  brandInk: '#6EE7B7',
  accent: '#FBBF24',
  accentSoft: '#3B2A0A',
  accentInk: '#FCD34D',
  danger: '#FCA5A5',
  dangerSoft: '#3F1518',
  mood1: '#7F1D1D',
  mood2: '#7C2D12',
  mood3: '#713F12',
  mood4: '#365314',
  mood5: '#064E3B',
  heat0: '#232830',
  heat1: '#14503B',
  heat2: '#1C7A59',
  heat3: '#27A877',
  heat4: '#34D399',
  shade: 'rgba(0, 0, 0, 0.4)',
};

export type PaletteColor = keyof typeof lightPalette;
