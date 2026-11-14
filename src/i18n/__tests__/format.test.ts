import { formatDay, formatNumber } from '../format';

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
    expect(formatNumber(10000, 'de')).toBe('10’000');
    expect(formatNumber(10000, 'it')).toBe('10’000');
  });

  it('uses comma grouping for English', () => {
    expect(formatNumber(10000, 'en')).toBe('10,000');
  });
});
