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
  const [year, month, day] = isoDay.split('-').map(Number);
  // Lokales Datum statt new Date(isoDay): Letzteres wäre UTC und könnte den Tag verschieben.
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(FORMAT_LOCALE[language], { dateStyle: 'long' }).format(date);
}

export function formatNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(FORMAT_LOCALE[language]).format(value);
}
