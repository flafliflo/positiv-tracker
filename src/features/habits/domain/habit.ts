import { addDays, toIsoDay } from '@/shared/day';
import type { DomainDeps } from '@/shared/domain-deps';

export const MAX_HABIT_NAME_LENGTH = 40;

export type Habit = {
  id: string;
  name: string;
  /** Tag, an dem die Gewohnheit angelegt wurde (ab dann zählt sie für die Quote). */
  day: string;
  createdAt: string;
};

/** „Gewohnheit X wurde am Tag Y erledigt." Gibt es den Eintrag nicht, ist sie offen. */
export type HabitCheck = { id: string; habitId: string; day: string };

export type HabitValidationError = 'nameRequired' | 'nameTooLong';

export type HabitResult = { ok: true; habit: Habit } | { ok: false; error: HabitValidationError };

export function createHabit(input: { name: string }, deps: DomainDeps): HabitResult {
  const name = input.name.trim();
  if (name.length === 0) return { ok: false, error: 'nameRequired' };
  if (name.length > MAX_HABIT_NAME_LENGTH) return { ok: false, error: 'nameTooLong' };

  const now = deps.now();
  return { ok: true, habit: { id: deps.generateId(), name, day: toIsoDay(now), createdAt: now.toISOString() } };
}

export function checkId(habitId: string, day: string): string {
  return `${habitId}|${day}`;
}

export function createCheck(habitId: string, day: string): HabitCheck {
  return { id: checkId(habitId, day), habitId, day };
}

export function isChecked(checks: readonly HabitCheck[], habitId: string, day: string): boolean {
  const id = checkId(habitId, day);
  return checks.some((check) => check.id === id);
}

/**
 * Anzahl aufeinanderfolgender erledigter Tage. Ist heute noch offen, zählt die
 * Serie bis gestern weiter – sie reisst erst, wenn ein ganzer Tag fehlt.
 */
export function habitStreak(checks: readonly HabitCheck[], habitId: string, today: string): number {
  const days = new Set(checks.filter((check) => check.habitId === habitId).map((check) => check.day));
  let day = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

/** Anteil erledigter Gewohnheits-Tage (0–1) im Zeitraum, oder `null`, wenn nichts fällig war. */
export function completionRate(
  habits: readonly Habit[],
  checks: readonly HabitCheck[],
  days: readonly string[],
): number | null {
  const done = new Set(checks.map((check) => check.id));
  let due = 0;
  let completed = 0;
  for (const habit of habits) {
    for (const day of days) {
      if (day < habit.day) continue; // gab es an diesem Tag noch nicht
      due += 1;
      if (done.has(checkId(habit.id, day))) completed += 1;
    }
  }
  return due === 0 ? null : completed / due;
}
