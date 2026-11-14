/**
 * Hilfsfunktionen für Kalendertage im Format 'YYYY-MM-DD' (lokale Zeit).
 * Wir rechnen bewusst mit Tagen statt Zeitstempeln: Ein Eintrag um 23:59 gehört
 * zu „heute", egal in welcher Zeitzone – wichtig für Streaks und Heatmap.
 */

export function toIsoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDay(isoDay: string): Date {
  const [year, month, day] = isoDay.split('-').map(Number);
  // Mittag statt Mitternacht: so verschiebt die Sommer-/Winterzeit nie den Tag.
  return new Date(year, month - 1, day, 12);
}

export function addDays(isoDay: string, amount: number): string {
  const date = parseIsoDay(isoDay);
  date.setDate(date.getDate() + amount);
  return toIsoDay(date);
}

/** Die letzten n Tage bis und mit heute, ältester zuerst. */
export function lastDays(today: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addDays(today, index - (count - 1)));
}

/** Wochentag mit Montag = 0 … Sonntag = 6. */
export function weekdayIndex(isoDay: string): number {
  return (parseIsoDay(isoDay).getDay() + 6) % 7;
}

export function startOfWeek(isoDay: string): string {
  return addDays(isoDay, -weekdayIndex(isoDay));
}
