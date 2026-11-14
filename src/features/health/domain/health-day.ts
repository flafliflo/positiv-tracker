/** Gesundheitswerte eines Kalendertags. `null` bedeutet: nichts erfasst. */
export type HealthDay = {
  /** Gleich wie `day` – pro Tag gibt es genau einen Datensatz. */
  id: string;
  day: string;
  steps: number | null;
  sleepHours: number | null;
  waterGlasses: number | null;
  trainingMinutes: number | null;
};

export const HEALTH_METRICS = ['steps', 'sleepHours', 'waterGlasses', 'trainingMinutes'] as const;
export type HealthMetric = (typeof HEALTH_METRICS)[number];

/** Erlaubter Bereich und Rundungsschritt pro Messwert. */
export const HEALTH_LIMITS: Record<HealthMetric, { min: number; max: number; step: number }> = {
  steps: { min: 0, max: 100000, step: 1 },
  sleepHours: { min: 0, max: 24, step: 0.5 },
  waterGlasses: { min: 0, max: 30, step: 1 },
  trainingMinutes: { min: 0, max: 600, step: 1 },
};

export function emptyHealthDay(day: string): HealthDay {
  return { id: day, day, steps: null, sleepHours: null, waterGlasses: null, trainingMinutes: null };
}

export function hasHealthData(healthDay: HealthDay): boolean {
  return HEALTH_METRICS.some((metric) => healthDay[metric] !== null);
}

/** Setzt einen Messwert (gerundet und auf den erlaubten Bereich begrenzt); `null` löscht ihn. */
export function setHealthMetric(healthDay: HealthDay, metric: HealthMetric, value: number | null): HealthDay {
  if (value === null) return { ...healthDay, [metric]: null };

  const { min, max, step } = HEALTH_LIMITS[metric];
  const rounded = Math.round(value / step) * step;
  return { ...healthDay, [metric]: Math.min(max, Math.max(min, rounded)) };
}

/** Startwert beim ersten Plus und Schrittweite der Plus/Minus-Knöpfe. */
const ADJUSTMENT: Record<HealthMetric, { start: number; step: number }> = {
  steps: { start: 1000, step: 500 },
  sleepHours: { start: 7, step: 0.5 },
  waterGlasses: { start: 1, step: 1 },
  trainingMinutes: { start: 15, step: 5 },
};

/** Plus/Minus-Knopf: erhöht oder verringert einen Messwert um einen sinnvollen Schritt. */
export function adjustHealthMetric(healthDay: HealthDay, metric: HealthMetric, direction: 1 | -1): HealthDay {
  const current = healthDay[metric];
  const { start, step } = ADJUSTMENT[metric];
  if (current === null) return direction === 1 ? setHealthMetric(healthDay, metric, start) : healthDay;
  return setHealthMetric(healthDay, metric, current + direction * step);
}

/**
 * Liest eine Zahl aus einer Nutzereingabe: "8'000", "10 000" und "7,5" funktionieren alle.
 * Gibt `null` zurück, wenn die Eingabe leer, negativ oder keine Zahl ist.
 */
export function parseMetricInput(text: string): number | null {
  const cleaned = text.trim().replace(/['’\s]/g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}
