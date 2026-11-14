import { formatDay, formatDecimal, formatNumber, formatShortDay, formatWeekdayDate, formatWeekdayShort } from '../format';

describe('formatDay', () => {
  it('formats a calendar day the German way', () => {
    expect(formatDay('2026-11-14', 'de')).toBe('14. November 2026');
  });

  it('formats a calendar day the Italian way', () => {
    expect(formatDay('2026-11-14', 'it')).toBe('14 novembre 2026');
  });

  it('formats a calendar day the English way', () => {
    expect(formatDay('2026-11-14', 'en')).toBe('14 November 2026');
  });

  it('does not shift the day across time zones', () => {
    expect(formatDay('2026-01-01', 'en')).toBe('1 January 2026');
  });
});

describe('formatNumber', () => {
  it('uses Swiss grouping for German and Italian', () => {
    // Je nach Unicode-Daten der Plattform ist das Trennzeichen ' (gerade) oder ’ (typografisch).
    expect(formatNumber(10000, 'de')).toMatch(/^10['’]000$/);
    expect(formatNumber(10000, 'it')).toMatch(/^10['’]000$/);
  });

  it('uses comma grouping for English', () => {
    expect(formatNumber(10000, 'en')).toBe('10,000');
  });
});

describe('formatWeekdayDate', () => {
  it('names weekday, day and month in each language', () => {
    expect(formatWeekdayDate('2026-11-15', 'de')).toMatch(/Sonntag.*15.*November/);
    expect(formatWeekdayDate('2026-11-15', 'it')).toMatch(/domenica.*15.*novembre/i);
    expect(formatWeekdayDate('2026-11-15', 'en')).toMatch(/Sunday.*15.*November/);
  });
});

describe('formatShortDay', () => {
  it('is a compact day and month', () => {
    expect(formatShortDay('2026-11-05', 'de')).toMatch(/^5. Nov/);
    expect(formatShortDay('2026-11-05', 'en')).toMatch(/^5 Nov/);
  });
});

describe('formatDecimal', () => {
  it('rounds to the given number of digits', () => {
    expect(formatDecimal(3.456, 'en', 1)).toBe('3.5');
    expect(formatDecimal(7, 'en', 1)).toBe('7.0');
    expect(formatDecimal(7.5, 'de', 1)).toMatch(/^7[.,]5$/);
  });
});

describe("formatWeekdayShort", () => {
  it("abbreviates the weekday without a trailing dot", () => {
    expect(formatWeekdayShort("2026-11-15", "de")).toBe("So");
    expect(formatWeekdayShort("2026-11-16", "de")).toBe("Mo");
    expect(formatWeekdayShort("2026-11-15", "it")).toBe("dom");
    expect(formatWeekdayShort("2026-11-15", "en")).toBe("Sun");
  });
});
