/**
 * Domänenlogik für "Wins" – reines TypeScript ohne React/Expo.
 * Dadurch ist sie schnell testbar und auf jeder Plattform identisch.
 */
import { toIsoDay } from '@/shared/day';
import type { DomainDeps } from '@/shared/domain-deps';

export { toIsoDay };

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

export type WinResult = { ok: true; win: Win } | { ok: false; error: WinValidationError };

/** @deprecated Alter Name, bleibt für bestehende Importe. */
export type CreateWinResult = WinResult;
export type CreateWinDeps = DomainDeps;

function validateText(rawText: string): { ok: true; text: string } | { ok: false; error: WinValidationError } {
  const text = rawText.trim();
  if (text.length === 0) return { ok: false, error: 'textRequired' };
  if (text.length > MAX_WIN_TEXT_LENGTH) return { ok: false, error: 'textTooLong' };
  return { ok: true, text };
}

export function createWin(input: WinInput, deps: DomainDeps): WinResult {
  const validated = validateText(input.text);
  if (!validated.ok) return validated;

  const now = deps.now();
  return {
    ok: true,
    win: {
      id: deps.generateId(),
      text: validated.text,
      category: input.category,
      day: toIsoDay(now),
      createdAt: now.toISOString(),
    },
  };
}

/** Ändert Text und Kategorie; ID, Tag und Zeitpunkt bleiben erhalten. */
export function editWin(win: Win, input: WinInput): WinResult {
  const validated = validateText(input.text);
  if (!validated.ok) return validated;
  return { ok: true, win: { ...win, text: validated.text, category: input.category } };
}

export function sortNewestFirst<T extends { createdAt: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
