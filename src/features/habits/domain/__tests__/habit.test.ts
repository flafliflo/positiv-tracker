import {
  completionRate,
  createCheck,
  createHabit,
  habitStreak,
  isChecked,
  MAX_HABIT_NAME_LENGTH,
  type Habit,
} from '../habit';

const now = new Date(2026, 10, 15, 8, 0);
const deps = { now: () => now, generateId: () => 'habit-1' };

describe('createHabit', () => {
  it('creates a habit with a trimmed name', () => {
    expect(createHabit({ name: '  Meditieren ' }, deps)).toEqual({
      ok: true,
      habit: { id: 'habit-1', name: 'Meditieren', day: '2026-11-15', createdAt: now.toISOString() },
    });
  });

  it('requires a name of at most 40 characters', () => {
    expect(createHabit({ name: ' ' }, deps)).toEqual({ ok: false, error: 'nameRequired' });
    expect(createHabit({ name: 'a'.repeat(MAX_HABIT_NAME_LENGTH + 1) }, deps)).toEqual({
      ok: false,
      error: 'nameTooLong',
    });
  });
});

describe('habit checks', () => {
  const checks = [
    createCheck('h1', '2026-11-13'),
    createCheck('h1', '2026-11-14'),
    createCheck('h1', '2026-11-15'),
    createCheck('h2', '2026-11-15'),
  ];

  it('a check has a stable id per habit and day', () => {
    expect(createCheck('h1', '2026-11-15')).toEqual({ id: 'h1|2026-11-15', habitId: 'h1', day: '2026-11-15' });
  });

  it('knows whether a habit is done on a day', () => {
    expect(isChecked(checks, 'h1', '2026-11-14')).toBe(true);
    expect(isChecked(checks, 'h2', '2026-11-14')).toBe(false);
  });

  it('counts the streak of consecutive days up to today', () => {
    expect(habitStreak(checks, 'h1', '2026-11-15')).toBe(3);
    expect(habitStreak(checks, 'h2', '2026-11-15')).toBe(1);
    expect(habitStreak(checks, 'h3', '2026-11-15')).toBe(0);
  });

  it('keeps the streak from yesterday alive until today is over', () => {
    expect(habitStreak(checks, 'h1', '2026-11-16')).toBe(3);
    expect(habitStreak(checks, 'h1', '2026-11-17')).toBe(0);
  });
});

describe('completionRate', () => {
  const habit = (id: string, day: string): Habit => ({ id, name: id, day, createdAt: `${day}T08:00:00.000Z` });

  it('is the share of done habit-days', () => {
    const habits = [habit('h1', '2026-11-01'), habit('h2', '2026-11-01')];
    const checks = [createCheck('h1', '2026-11-14'), createCheck('h1', '2026-11-15'), createCheck('h2', '2026-11-15')];
    expect(completionRate(habits, checks, ['2026-11-14', '2026-11-15'])).toBe(0.75);
  });

  it('does not count days before a habit existed', () => {
    const habits = [habit('h1', '2026-11-15')];
    const checks = [createCheck('h1', '2026-11-15')];
    expect(completionRate(habits, checks, ['2026-11-14', '2026-11-15'])).toBe(1);
  });

  it('is null when there is nothing to complete', () => {
    expect(completionRate([], [], ['2026-11-15'])).toBeNull();
  });
});
