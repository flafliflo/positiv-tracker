import { createCheck, type Habit } from '@/features/habits/domain/habit';
import { emptyHealthDay, setHealthMetric, type HealthDay } from '@/features/health/domain/health-day';
import type { JournalEntry, Mood } from '@/features/journal/domain/journal-entry';
import type { Win } from '@/features/wins/domain/win';

import {
  activityByDay,
  activityLevel,
  bestStreak,
  currentStreak,
  emptyAppData,
  heatmapWeeks,
  moodByDay,
  moodStepsInsight,
  summarizePeriod,
  type AppData,
} from '../stats';

const win = (id: string, day: string): Win => ({ id, text: id, category: 'other', day, createdAt: `${day}T10:00:00.000Z` });
const entry = (id: string, day: string, mood: Mood): JournalEntry => ({ id, text: '', mood, day, createdAt: `${day}T10:00:00.000Z` });
const habit = (id: string, day: string): Habit => ({ id, name: id, day, createdAt: `${day}T08:00:00.000Z` });
const health = (day: string, values: Partial<HealthDay>): HealthDay => ({ ...emptyHealthDay(day), ...values });
const data = (partial: Partial<AppData>): AppData => ({ ...emptyAppData, ...partial });

describe('activityByDay', () => {
  it('counts wins, journal entries, habit checks and days with health values', () => {
    const activity = activityByDay(
      data({
        wins: [win('a', '2026-11-15'), win('b', '2026-11-15'), win('c', '2026-11-14')],
        journal: [entry('e', '2026-11-15', 4)],
        habitChecks: [createCheck('h', '2026-11-15')],
        health: [setHealthMetric(emptyHealthDay('2026-11-15'), 'steps', 5000), emptyHealthDay('2026-11-13')],
      }),
    );

    expect(activity.get('2026-11-15')).toBe(5);
    expect(activity.get('2026-11-14')).toBe(1);
    expect(activity.has('2026-11-13')).toBe(false);
  });
});

describe('streaks', () => {
  const days = new Set(['2026-11-10', '2026-11-11', '2026-11-13', '2026-11-14', '2026-11-15']);

  it('counts consecutive active days up to today', () => {
    expect(currentStreak(days, '2026-11-15')).toBe(3);
  });

  it('still counts the streak when today has no activity yet', () => {
    expect(currentStreak(days, '2026-11-16')).toBe(3);
  });

  it('is zero after a missed day', () => {
    expect(currentStreak(days, '2026-11-17')).toBe(0);
    expect(currentStreak(new Set(), '2026-11-15')).toBe(0);
  });

  it('finds the longest streak ever', () => {
    expect(bestStreak(days)).toBe(3);
    expect(bestStreak(new Set(['2026-11-01']))).toBe(1);
    expect(bestStreak(new Set())).toBe(0);
  });
});

describe('heatmap', () => {
  it('maps activity counts to five intensity levels', () => {
    expect([0, 1, 2, 3, 4, 5, 12].map(activityLevel)).toEqual([0, 1, 2, 3, 3, 4, 4]);
  });

  it('builds full weeks from Monday to Sunday, ending with the current week', () => {
    const weeks = heatmapWeeks(new Map([['2026-11-11', 2]]), '2026-11-12', 2);

    expect(weeks).toHaveLength(2);
    expect(weeks[0].map((cell) => cell.day)).toEqual([
      '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08',
    ]);
    expect(weeks[1][0].day).toBe('2026-11-09');
    expect(weeks[1][2]).toEqual({ day: '2026-11-11', count: 2, level: 2, isFuture: false });
    expect(weeks[1][3]).toEqual({ day: '2026-11-12', count: 0, level: 0, isFuture: false });
    expect(weeks[1][4].isFuture).toBe(true);
  });
});

describe('summarizePeriod', () => {
  const days = ['2026-11-14', '2026-11-15'];

  it('summarises wins, mood, health and habits for the given days', () => {
    const summary = summarizePeriod(
      data({
        wins: [win('a', '2026-11-15'), win('b', '2026-11-14'), win('old', '2026-11-01')],
        journal: [entry('e1', '2026-11-14', 3), entry('e2', '2026-11-15', 4), entry('old', '2026-11-01', 1)],
        habits: [habit('h', '2026-11-01')],
        habitChecks: [createCheck('h', '2026-11-15')],
        health: [
          health('2026-11-14', { steps: 6000, sleepHours: 7, waterGlasses: 4, trainingMinutes: 30 }),
          health('2026-11-15', { steps: 10000, sleepHours: 8, waterGlasses: 8, trainingMinutes: 45 }),
          health('2026-11-01', { steps: 1 }),
        ],
      }),
      days,
    );

    expect(summary).toEqual({
      wins: 2,
      journalEntries: 2,
      averageMood: 3.5,
      averageSteps: 8000,
      averageSleep: 7.5,
      averageWater: 6,
      trainingMinutes: 75,
      habitCompletion: 0.5,
      activeDays: 2,
    });
  });

  it('uses null for averages without data', () => {
    expect(summarizePeriod(emptyAppData, days)).toEqual({
      wins: 0,
      journalEntries: 0,
      averageMood: null,
      averageSteps: null,
      averageSleep: null,
      averageWater: null,
      trainingMinutes: 0,
      habitCompletion: null,
      activeDays: 0,
    });
  });
});

describe('moodByDay', () => {
  it('averages several entries of the same day', () => {
    const moods = moodByDay([entry('a', '2026-11-15', 2), entry('b', '2026-11-15', 5), entry('c', '2026-11-14', 3)]);

    expect(moods.get('2026-11-15')).toBe(3.5);
    expect(moods.get('2026-11-14')).toBe(3);
  });
});

describe('moodStepsInsight', () => {
  const day = (n: number) => `2026-11-${String(n).padStart(2, '0')}`;

  it('compares mood on days above and below the step threshold', () => {
    const insight = moodStepsInsight(
      data({
        journal: [entry('1', day(1), 5), entry('2', day(2), 4), entry('3', day(3), 5), entry('4', day(4), 3), entry('5', day(5), 4), entry('6', day(6), 3)],
        health: [
          health(day(1), { steps: 12000 }), health(day(2), { steps: 9000 }), health(day(3), { steps: 8000 }),
          health(day(4), { steps: 3000 }), health(day(5), { steps: 5000 }), health(day(6), { steps: 100 }),
        ],
      }),
      { threshold: 8000, minDays: 3 },
    );

    // Mittelwert 4.67 gegenüber 3.33 → +40 %
    expect(insight).toEqual({ threshold: 8000, percentDifference: 40, activeDays: 3, calmDays: 3 });
  });

  it('stays silent until there is enough data in both groups', () => {
    const insight = moodStepsInsight(
      data({
        journal: [entry('1', day(1), 5), entry('2', day(2), 2)],
        health: [health(day(1), { steps: 12000 }), health(day(2), { steps: 100 })],
      }),
      { threshold: 8000, minDays: 3 },
    );

    expect(insight).toBeNull();
  });
});
