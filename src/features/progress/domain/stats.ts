import { completionRate, type Habit, type HabitCheck } from '@/features/habits/domain/habit';
import { hasHealthData, type HealthDay } from '@/features/health/domain/health-day';
import type { JournalEntry } from '@/features/journal/domain/journal-entry';
import type { Win } from '@/features/wins/domain/win';
import { addDays, startOfWeek } from '@/shared/day';

/** Alle Daten der App an einem Ort – Grundlage für Streaks, Heatmap und Rückblick. */
export type AppData = {
  wins: Win[];
  journal: JournalEntry[];
  habits: Habit[];
  habitChecks: HabitCheck[];
  health: HealthDay[];
};

export const emptyAppData: AppData = { wins: [], journal: [], habits: [], habitChecks: [], health: [] };

/** Aktivität pro Tag: jeder Win, Journal-Eintrag und Habit-Haken zählt 1, Gesundheitswerte zählen 1 pro Tag. */
export function activityByDay(data: AppData): Map<string, number> {
  const activity = new Map<string, number>();
  const add = (day: string) => activity.set(day, (activity.get(day) ?? 0) + 1);

  data.wins.forEach((win) => add(win.day));
  data.journal.forEach((entry) => add(entry.day));
  data.habitChecks.forEach((check) => add(check.day));
  data.health.filter(hasHealthData).forEach((healthDay) => add(healthDay.day));

  return activity;
}

/** Serie aktiver Tage bis heute. Ist heute noch nichts erfasst, zählt die Serie bis gestern. */
export function currentStreak(activeDays: ReadonlySet<string>, today: string): number {
  let day = activeDays.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (activeDays.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

export function bestStreak(activeDays: ReadonlySet<string>): number {
  let best = 0;
  for (const day of activeDays) {
    if (activeDays.has(addDays(day, -1))) continue; // nur beim ersten Tag einer Serie zählen
    let length = 1;
    while (activeDays.has(addDays(day, length))) length += 1;
    best = Math.max(best, length);
  }
  return best;
}

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export function activityLevel(count: number): ActivityLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

export type HeatmapCell = { day: string; count: number; level: ActivityLevel; isFuture: boolean };

/** Kalender-Heatmap: `weeks` ganze Wochen (Mo–So), die letzte enthält heute. */
export function heatmapWeeks(activity: ReadonlyMap<string, number>, today: string, weeks: number): HeatmapCell[][] {
  const firstDay = addDays(startOfWeek(today), -7 * (weeks - 1));

  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const day = addDays(firstDay, week * 7 + weekday);
      const count = activity.get(day) ?? 0;
      return { day, count, level: activityLevel(count), isFuture: day > today };
    }),
  );
}

function average(values: readonly number[]): number | null {
  return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function notNull<T>(value: T | null): value is T {
  return value !== null;
}

/** Durchschnittliche Stimmung pro Tag (mehrere Einträge am selben Tag werden gemittelt). */
export function moodByDay(journal: readonly JournalEntry[]): Map<string, number> {
  const moods = new Map<string, number[]>();
  for (const entry of journal) {
    moods.set(entry.day, [...(moods.get(entry.day) ?? []), entry.mood]);
  }
  return new Map([...moods].map(([day, values]) => [day, average(values) as number]));
}

export type PeriodSummary = {
  wins: number;
  journalEntries: number;
  averageMood: number | null;
  averageSteps: number | null;
  averageSleep: number | null;
  averageWater: number | null;
  trainingMinutes: number;
  /** Anteil erledigter Gewohnheiten (0–1). */
  habitCompletion: number | null;
  activeDays: number;
};

export function summarizePeriod(data: AppData, days: readonly string[]): PeriodSummary {
  const inPeriod = new Set(days);
  const journal = data.journal.filter((entry) => inPeriod.has(entry.day));
  const health = data.health.filter((healthDay) => inPeriod.has(healthDay.day));
  const activity = activityByDay(data);

  return {
    wins: data.wins.filter((win) => inPeriod.has(win.day)).length,
    journalEntries: journal.length,
    averageMood: average(journal.map((entry) => entry.mood)),
    averageSteps: average(health.map((healthDay) => healthDay.steps).filter(notNull)),
    averageSleep: average(health.map((healthDay) => healthDay.sleepHours).filter(notNull)),
    averageWater: average(health.map((healthDay) => healthDay.waterGlasses).filter(notNull)),
    trainingMinutes: health.reduce((sum, healthDay) => sum + (healthDay.trainingMinutes ?? 0), 0),
    habitCompletion: completionRate(data.habits, data.habitChecks, days),
    activeDays: days.filter((day) => activity.has(day)).length,
  };
}

export type MoodStepsInsight = {
  threshold: number;
  /** Um wie viele Prozent die Stimmung an aktiven Tagen besser (+) oder schlechter (−) ist. */
  percentDifference: number;
  activeDays: number;
  calmDays: number;
};

/**
 * Vergleicht die Stimmung an Tagen mit vielen Schritten mit den übrigen Tagen.
 * Liefert erst ein Ergebnis, wenn beide Gruppen genug Tage haben – sonst wäre es Zufall.
 */
export function moodStepsInsight(
  data: AppData,
  { threshold, minDays }: { threshold: number; minDays: number },
): MoodStepsInsight | null {
  const moods = moodByDay(data.journal);
  const active: number[] = [];
  const calm: number[] = [];

  for (const healthDay of data.health) {
    const mood = moods.get(healthDay.day);
    if (mood === undefined || healthDay.steps === null) continue;
    (healthDay.steps >= threshold ? active : calm).push(mood);
  }

  if (active.length < minDays || calm.length < minDays) return null;

  const activeMood = average(active) as number;
  const calmMood = average(calm) as number;
  return {
    threshold,
    percentDifference: Math.round(((activeMood - calmMood) / calmMood) * 100),
    activeDays: active.length,
    calmDays: calm.length,
  };
}
