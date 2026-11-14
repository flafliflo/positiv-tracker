import { toIsoDay } from '@/shared/day';
import type { DomainDeps } from '@/shared/domain-deps';

/** Stimmung von 1 (sehr schlecht) bis 5 (sehr gut). */
export const MOODS = [1, 2, 3, 4, 5] as const;
export type Mood = (typeof MOODS)[number];

export const MAX_JOURNAL_TEXT_LENGTH = 5000;

export type JournalEntry = {
  id: string;
  /** Freier Text; darf leer sein (schneller Stimmungs-Check-in). */
  text: string;
  mood: Mood;
  day: string;
  createdAt: string;
};

export type JournalInput = { text: string; mood: Mood | null };

export type JournalValidationError = 'moodRequired' | 'textTooLong';

export type JournalResult =
  | { ok: true; entry: JournalEntry }
  | { ok: false; error: JournalValidationError };

function validate(input: JournalInput): { ok: true; text: string; mood: Mood } | { ok: false; error: JournalValidationError } {
  if (input.mood === null) return { ok: false, error: 'moodRequired' };
  const text = input.text.trim();
  if (text.length > MAX_JOURNAL_TEXT_LENGTH) return { ok: false, error: 'textTooLong' };
  return { ok: true, text, mood: input.mood };
}

export function createJournalEntry(input: JournalInput, deps: DomainDeps): JournalResult {
  const validated = validate(input);
  if (!validated.ok) return validated;

  const now = deps.now();
  return {
    ok: true,
    entry: {
      id: deps.generateId(),
      text: validated.text,
      mood: validated.mood,
      day: toIsoDay(now),
      createdAt: now.toISOString(),
    },
  };
}

export function editJournalEntry(entry: JournalEntry, input: JournalInput): JournalResult {
  const validated = validate(input);
  if (!validated.ok) return validated;
  return { ok: true, entry: { ...entry, text: validated.text, mood: validated.mood } };
}
