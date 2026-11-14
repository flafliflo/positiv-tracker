import { addDays, lastDays, parseIsoDay, startOfWeek, toIsoDay, weekdayIndex } from '../day';

describe('day helpers', () => {
  it('toIsoDay uses the local calendar day', () => {
    expect(toIsoDay(new Date(2026, 0, 5, 0, 15))).toBe('2026-01-05');
    expect(toIsoDay(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });

  it('parseIsoDay is the inverse of toIsoDay', () => {
    expect(toIsoDay(parseIsoDay('2026-03-29'))).toBe('2026-03-29');
  });

  it('addDays crosses month, year and daylight-saving boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30'); // Sommerzeit-Umstellung CH
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26'); // Winterzeit-Umstellung CH
  });

  it('lastDays returns n days ending today, oldest first', () => {
    expect(lastDays('2026-11-15', 3)).toEqual(['2026-11-13', '2026-11-14', '2026-11-15']);
    expect(lastDays('2026-11-15', 1)).toEqual(['2026-11-15']);
  });

  it('weeks start on Monday', () => {
    expect(weekdayIndex('2026-11-09')).toBe(0); // Montag
    expect(weekdayIndex('2026-11-15')).toBe(6); // Sonntag
    expect(startOfWeek('2026-11-15')).toBe('2026-11-09');
    expect(startOfWeek('2026-11-09')).toBe('2026-11-09');
  });
});
