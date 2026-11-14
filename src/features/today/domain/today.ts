import { parseIsoDay } from '@/shared/day';

export type GreetingKey = 'morning' | 'day' | 'evening';

/** Begrüssung nach Tageszeit: 5–11 Uhr Morgen, 11–18 Uhr Tag, sonst Abend. */
export function greetingKey(date: Date): GreetingKey {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 18) return 'day';
  return 'evening';
}

/** Anzahl der Impulse in den Übersetzungen (today.prompt.items.1 … 7). */
export const PROMPT_COUNT = 7;

/** Jeden Tag ein anderer Impuls, reihum – am selben Tag immer derselbe. */
export function promptNumberForDay(isoDay: string): number {
  const dayNumber = Math.round(parseIsoDay(isoDay).getTime() / 86_400_000);
  return (dayNumber % PROMPT_COUNT) + 1;
}
