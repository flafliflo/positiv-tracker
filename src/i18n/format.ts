import { parseIsoDay } from '@/shared/day';

import type { Language } from './languages';

/**
 * Regionale Formatierung pro App-Sprache. Die App startet in der Schweiz,
 * darum Schweizer Varianten für Deutsch und Italienisch (10’000 statt 10.000).
 */
const FORMAT_LOCALE: Record<Language, string> = {
  de: 'de-CH',
  it: 'it-CH',
  en: 'en-GB',
};

/** Formatiert einen Kalendertag im Format 'YYYY-MM-DD', z. B. '14. November 2026'. */
export function formatDay(isoDay: string, language: Language): string {
  const date = parseIsoDay(isoDay);
  return new Intl.DateTimeFormat(FORMAT_LOCALE[language], { dateStyle: 'long' }).format(date);
}

export function formatNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(FORMAT_LOCALE[language]).format(value);
}

/** Wochentag, Tag und Monat, z. B. 'Sonntag, 15. November'. */
export function formatWeekdayDate(isoDay: string, language: Language): string {
  return new Intl.DateTimeFormat(FORMAT_LOCALE[language], { weekday: 'long', day: 'numeric', month: 'long' }).format(
    parseIsoDay(isoDay),
  );
}

/** Kurzes Datum für enge Stellen, z. B. '5. Nov.'. */
export function formatShortDay(isoDay: string, language: Language): string {
  return new Intl.DateTimeFormat(FORMAT_LOCALE[language], { day: 'numeric', month: 'short' }).format(parseIsoDay(isoDay));
}

/** Zahl mit fester Anzahl Nachkommastellen, z. B. 7.5. */
export function formatDecimal(value: number, language: Language, digits: number): string {
  return new Intl.NumberFormat(FORMAT_LOCALE[language], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Anteil 0–1 als Prozent, z. B. 0.5 → '50 %'. */
export function formatPercent(value: number, language: Language): string {
  return new Intl.NumberFormat(FORMAT_LOCALE[language], { style: 'percent', maximumFractionDigits: 0 }).format(value);
}
