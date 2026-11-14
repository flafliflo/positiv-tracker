import { greetingKey, PROMPT_COUNT, promptNumberForDay } from '../today';

describe('greetingKey', () => {
  it('greets by time of day', () => {
    expect(greetingKey(new Date(2026, 10, 15, 6, 0))).toBe('morning');
    expect(greetingKey(new Date(2026, 10, 15, 10, 59))).toBe('morning');
    expect(greetingKey(new Date(2026, 10, 15, 11, 0))).toBe('day');
    expect(greetingKey(new Date(2026, 10, 15, 17, 59))).toBe('day');
    expect(greetingKey(new Date(2026, 10, 15, 18, 0))).toBe('evening');
    expect(greetingKey(new Date(2026, 10, 15, 2, 0))).toBe('evening');
  });
});

describe('promptNumberForDay', () => {
  it('rotates through all prompts, one per day', () => {
    const numbers = ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'].map(
      promptNumberForDay,
    );

    expect(PROMPT_COUNT).toBe(7);
    expect([...numbers].sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('shows the same prompt all day', () => {
    expect(promptNumberForDay('2026-11-15')).toBe(promptNumberForDay('2026-11-15'));
  });
});
