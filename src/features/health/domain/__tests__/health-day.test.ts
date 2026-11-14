import { adjustHealthMetric, emptyHealthDay, hasHealthData, parseMetricInput, setHealthMetric } from '../health-day';

describe('health day', () => {
  const empty = emptyHealthDay('2026-11-15');

  it('starts without any values and uses the day as id', () => {
    expect(empty).toEqual({
      id: '2026-11-15',
      day: '2026-11-15',
      steps: null,
      sleepHours: null,
      waterGlasses: null,
      trainingMinutes: null,
    });
    expect(hasHealthData(empty)).toBe(false);
  });

  it('stores a metric without mutating the original', () => {
    const updated = setHealthMetric(empty, 'steps', 8421);
    expect(updated.steps).toBe(8421);
    expect(empty.steps).toBeNull();
    expect(hasHealthData(updated)).toBe(true);
  });

  it('rounds steps, water and training to whole numbers and sleep to half hours', () => {
    expect(setHealthMetric(empty, 'steps', 1234.6).steps).toBe(1235);
    expect(setHealthMetric(empty, 'waterGlasses', 2.4).waterGlasses).toBe(2);
    expect(setHealthMetric(empty, 'trainingMinutes', 44.5).trainingMinutes).toBe(45);
    expect(setHealthMetric(empty, 'sleepHours', 7.3).sleepHours).toBe(7.5);
  });

  it('clamps values into a sensible range', () => {
    expect(setHealthMetric(empty, 'steps', -5).steps).toBe(0);
    expect(setHealthMetric(empty, 'steps', 999999).steps).toBe(100000);
    expect(setHealthMetric(empty, 'sleepHours', 30).sleepHours).toBe(24);
    expect(setHealthMetric(empty, 'waterGlasses', 99).waterGlasses).toBe(30);
    expect(setHealthMetric(empty, 'trainingMinutes', 5000).trainingMinutes).toBe(600);
  });

  it('clears a metric with null', () => {
    const withSteps = setHealthMetric(empty, 'steps', 100);
    expect(setHealthMetric(withSteps, 'steps', null).steps).toBeNull();
  });
});

describe('parseMetricInput', () => {
  it('understands Swiss, German and English number formats', () => {
    expect(parseMetricInput("8'000")).toBe(8000);
    expect(parseMetricInput('8’000')).toBe(8000);
    expect(parseMetricInput('10 000')).toBe(10000);
    expect(parseMetricInput('7,5')).toBe(7.5);
    expect(parseMetricInput('7.5')).toBe(7.5);
    expect(parseMetricInput(' 42 ')).toBe(42);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseMetricInput('')).toBeNull();
    expect(parseMetricInput('  ')).toBeNull();
    expect(parseMetricInput('abc')).toBeNull();
    expect(parseMetricInput('-3')).toBeNull();
  });
});

describe('adjustHealthMetric (plus/minus buttons)', () => {
  const empty = emptyHealthDay('2026-11-15');

  it('starts from a sensible value on the first plus', () => {
    expect(adjustHealthMetric(empty, 'sleepHours', 1).sleepHours).toBe(7);
    expect(adjustHealthMetric(empty, 'waterGlasses', 1).waterGlasses).toBe(1);
    expect(adjustHealthMetric(empty, 'trainingMinutes', 1).trainingMinutes).toBe(15);
  });

  it('then moves in steps: half hours, single glasses, 5 minutes', () => {
    expect(adjustHealthMetric({ ...empty, sleepHours: 7 }, 'sleepHours', 1).sleepHours).toBe(7.5);
    expect(adjustHealthMetric({ ...empty, sleepHours: 7 }, 'sleepHours', -1).sleepHours).toBe(6.5);
    expect(adjustHealthMetric({ ...empty, waterGlasses: 3 }, 'waterGlasses', -1).waterGlasses).toBe(2);
    expect(adjustHealthMetric({ ...empty, trainingMinutes: 15 }, 'trainingMinutes', 1).trainingMinutes).toBe(20);
  });

  it('never goes below zero and ignores minus on an empty value', () => {
    expect(adjustHealthMetric({ ...empty, waterGlasses: 0 }, 'waterGlasses', -1).waterGlasses).toBe(0);
    expect(adjustHealthMetric(empty, 'waterGlasses', -1).waterGlasses).toBeNull();
  });
});
