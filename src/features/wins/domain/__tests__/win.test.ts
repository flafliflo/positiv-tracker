import { createWin, MAX_WIN_TEXT_LENGTH, sortNewestFirst, toIsoDay, WIN_CATEGORIES } from '../win';

const now = new Date(2026, 10, 14, 21, 30); // 14. November 2026, 21:30 Ortszeit
const deps = { now: () => now, generateId: () => 'win-1' };

describe('createWin', () => {
  it('creates a win with id, trimmed text, category, day and timestamp', () => {
    const result = createWin({ text: '  10 km gelaufen  ', category: 'health' }, deps);

    expect(result).toEqual({
      ok: true,
      win: {
        id: 'win-1',
        text: '10 km gelaufen',
        category: 'health',
        day: '2026-11-14',
        createdAt: now.toISOString(),
      },
    });
  });

  it('rejects an empty or whitespace-only text', () => {
    expect(createWin({ text: '', category: 'work' }, deps)).toEqual({
      ok: false,
      error: 'textRequired',
    });
    expect(createWin({ text: '   ', category: 'work' }, deps)).toEqual({
      ok: false,
      error: 'textRequired',
    });
  });

  it('rejects a text longer than the maximum', () => {
    const tooLong = 'a'.repeat(MAX_WIN_TEXT_LENGTH + 1);
    expect(createWin({ text: tooLong, category: 'work' }, deps)).toEqual({
      ok: false,
      error: 'textTooLong',
    });
  });

  it('accepts a text of exactly the maximum length', () => {
    const maxLength = 'a'.repeat(MAX_WIN_TEXT_LENGTH);
    expect(createWin({ text: maxLength, category: 'work' }, deps).ok).toBe(true);
  });
});

describe('WIN_CATEGORIES', () => {
  it('offers the six categories', () => {
    expect(WIN_CATEGORIES).toEqual([
      'health',
      'work',
      'learning',
      'relationships',
      'mindset',
      'other',
    ]);
  });
});

describe('toIsoDay', () => {
  it('uses the local calendar day, not UTC', () => {
    expect(toIsoDay(new Date(2026, 0, 5, 0, 15))).toBe('2026-01-05');
    expect(toIsoDay(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });
});

describe('sortNewestFirst', () => {
  it('orders wins by creation time, newest first, without mutating the input', () => {
    const older = { id: 'a', text: 'a', category: 'other', day: '2026-11-13', createdAt: '2026-11-13T08:00:00.000Z' } as const;
    const newer = { id: 'b', text: 'b', category: 'other', day: '2026-11-14', createdAt: '2026-11-14T08:00:00.000Z' } as const;
    const input = [older, newer];

    expect(sortNewestFirst(input)).toEqual([newer, older]);
    expect(input).toEqual([older, newer]);
  });
});
