/**
 * Domänenlogik für "Wins" – reines TypeScript ohne React/Expo.
 * Dadurch ist sie schnell testbar und auf jeder Plattform identisch.
 */

export const WIN_CATEGORIES = [
  'health',
  'work',
  'learning',
  'relationships',
  'mindset',
  'other',
] as const;

export type WinCategory = (typeof WIN_CATEGORIES)[number];

export const MAX_WIN_TEXT_LENGTH = 280;

export type Win = {
  id: string;
  text: string;
  category: WinCategory;
  /** Lokaler Kalendertag im Format YYYY-MM-DD (für Streaks/Heatmap). */
  day: string;
  /** Exakter Zeitpunkt als ISO-String (für die Sortierung). */
  createdAt: string;
};

export type WinInput = { text: string; category: WinCategory };

export type WinValidationError = 'textRequired' | 'textTooLong';

export type CreateWinResult = { ok: true; win: Win } | { ok: false; error: WinValidationError };

/** Uhr und ID-Erzeugung werden übergeben, damit Tests deterministisch sind. */
export type CreateWinDeps = { now: () => Date; generateId: () => string };

export function createWin(input: WinInput, deps: CreateWinDeps): CreateWinResult {
  const text = input.text.trim();
  if (text.length === 0) return { ok: false, error: 'textRequired' };
  if (text.length > MAX_WIN_TEXT_LENGTH) return { ok: false, error: 'textTooLong' };

  const now = deps.now();
  return {
    ok: true,
    win: {
      id: deps.generateId(),
      text,
      category: input.category,
      day: toIsoDay(now),
      createdAt: now.toISOString(),
    },
  };
}

export function toIsoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function sortNewestFirst(wins: readonly Win[]): Win[] {
  return [...wins].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
