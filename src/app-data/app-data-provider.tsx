import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { checkId, createCheck, createHabit, type HabitValidationError } from '@/features/habits/domain/habit';
import { emptyHealthDay, setHealthMetric as applyHealthMetric, type HealthMetric } from '@/features/health/domain/health-day';
import {
  createJournalEntry,
  editJournalEntry,
  type JournalInput,
  type JournalValidationError,
} from '@/features/journal/domain/journal-entry';
import { emptyAppData, type AppData } from '@/features/progress/domain/stats';
import { createWin, editWin, type WinInput, type WinValidationError } from '@/features/wins/domain/win';
import { toIsoDay } from '@/shared/day';

import { deleteAllData, exportAppData, loadAppData, type ExportDocument, type Repositories } from './repositories';

/** Ergebnis einer Aktion: geklappt, oder ein Fehler-Schlüssel (für die Übersetzung in der UI). */
export type ActionResult<E extends string = never> = { ok: true } | { ok: false; error: E | 'saveFailed' | 'notFound' };

export type AppDataActions = {
  addWin(input: WinInput): Promise<ActionResult<WinValidationError>>;
  updateWin(id: string, input: WinInput): Promise<ActionResult<WinValidationError>>;
  removeWin(id: string): Promise<ActionResult>;
  addJournalEntry(input: JournalInput): Promise<ActionResult<JournalValidationError>>;
  updateJournalEntry(id: string, input: JournalInput): Promise<ActionResult<JournalValidationError>>;
  removeJournalEntry(id: string): Promise<ActionResult>;
  addHabit(name: string): Promise<ActionResult<HabitValidationError>>;
  removeHabit(id: string): Promise<ActionResult>;
  toggleHabit(habitId: string, day: string): Promise<ActionResult>;
  setHealthMetric(day: string, metric: HealthMetric, value: number | null): Promise<ActionResult>;
  exportData(): Promise<ExportDocument>;
  deleteAllData(): Promise<ActionResult>;
};

export type AppDataValue = {
  status: 'loading' | 'ready' | 'error';
  data: AppData;
  /** Heutiger Kalendertag (YYYY-MM-DD). */
  today: string;
  /** Aktuelle Uhrzeit (austauschbar für Tests). */
  clock: () => Date;
  actions: AppDataActions;
};

const AppDataContext = createContext<AppDataValue | null>(null);

type Props = {
  repositories: Repositories;
  /** Uhr und ID-Erzeugung sind austauschbar, damit Tests feste Werte nutzen können. */
  now: () => Date;
  generateId: () => string;
  children: ReactNode;
};

const saveFailed = { ok: false, error: 'saveFailed' } as const;
const notFound = { ok: false, error: 'notFound' } as const;

/** Fügt einen Datensatz in eine Liste ein oder ersetzt den mit derselben ID. */
function upsertById<T extends { id: string }>(items: readonly T[], item: T): T[] {
  return items.some((existing) => existing.id === item.id)
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : [...items, item];
}

/**
 * Hält alle App-Daten im Speicher und synchronisiert jede Änderung mit den Repositories.
 * Weil alle Screens dieselbe Quelle lesen, sind Heute-Ansicht und Statistik immer aktuell.
 */
export function AppDataProvider({ repositories, now, generateId, children }: Props) {
  const [status, setStatus] = useState<AppDataValue['status']>('loading');
  const [data, setData] = useState<AppData>(emptyAppData);

  useEffect(() => {
    let active = true;
    loadAppData(repositories)
      .then((loaded) => {
        if (!active) return;
        setData(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [repositories]);

  /** Führt einen Speicherzugriff aus und übernimmt die Änderung nur bei Erfolg in den Zustand. */
  const persist = useCallback(
    async (write: () => Promise<unknown>, update: (current: AppData) => AppData): Promise<ActionResult> => {
      try {
        await write();
      } catch {
        return saveFailed;
      }
      setData(update);
      return { ok: true };
    },
    [],
  );

  const actions = useMemo<AppDataActions>(() => {
    const deps = { now, generateId };

    return {
      async addWin(input) {
        const result = createWin(input, deps);
        if (!result.ok) return result;
        return persist(
          () => repositories.wins.upsert(result.win),
          (current) => ({ ...current, wins: upsertById(current.wins, result.win) }),
        );
      },

      async updateWin(id, input) {
        const existing = (await repositories.wins.list()).find((win) => win.id === id);
        if (!existing) return notFound;
        const result = editWin(existing, input);
        if (!result.ok) return result;
        return persist(
          () => repositories.wins.upsert(result.win),
          (current) => ({ ...current, wins: upsertById(current.wins, result.win) }),
        );
      },

      removeWin(id) {
        return persist(
          () => repositories.wins.remove(id),
          (current) => ({ ...current, wins: current.wins.filter((win) => win.id !== id) }),
        );
      },

      async addJournalEntry(input) {
        const result = createJournalEntry(input, deps);
        if (!result.ok) return result;
        return persist(
          () => repositories.journal.upsert(result.entry),
          (current) => ({ ...current, journal: upsertById(current.journal, result.entry) }),
        );
      },

      async updateJournalEntry(id, input) {
        const existing = (await repositories.journal.list()).find((entry) => entry.id === id);
        if (!existing) return notFound;
        const result = editJournalEntry(existing, input);
        if (!result.ok) return result;
        return persist(
          () => repositories.journal.upsert(result.entry),
          (current) => ({ ...current, journal: upsertById(current.journal, result.entry) }),
        );
      },

      removeJournalEntry(id) {
        return persist(
          () => repositories.journal.remove(id),
          (current) => ({ ...current, journal: current.journal.filter((entry) => entry.id !== id) }),
        );
      },

      async addHabit(name) {
        const result = createHabit({ name }, deps);
        if (!result.ok) return result;
        return persist(
          () => repositories.habits.upsert(result.habit),
          (current) => ({ ...current, habits: upsertById(current.habits, result.habit) }),
        );
      },

      removeHabit(id) {
        return persist(
          async () => {
            const checks = (await repositories.habitChecks.list()).filter((check) => check.habitId === id);
            await Promise.all(checks.map((check) => repositories.habitChecks.remove(check.id)));
            await repositories.habits.remove(id);
          },
          (current) => ({
            ...current,
            habits: current.habits.filter((habit) => habit.id !== id),
            habitChecks: current.habitChecks.filter((check) => check.habitId !== id),
          }),
        );
      },

      async toggleHabit(habitId, day) {
        const id = checkId(habitId, day);
        const done = (await repositories.habitChecks.list()).some((check) => check.id === id);
        if (done) {
          return persist(
            () => repositories.habitChecks.remove(id),
            (current) => ({ ...current, habitChecks: current.habitChecks.filter((check) => check.id !== id) }),
          );
        }
        const check = createCheck(habitId, day);
        return persist(
          () => repositories.habitChecks.upsert(check),
          (current) => ({ ...current, habitChecks: upsertById(current.habitChecks, check) }),
        );
      },

      async setHealthMetric(day, metric, value) {
        const existing = (await repositories.health.list()).find((healthDay) => healthDay.day === day);
        const updated = applyHealthMetric(existing ?? emptyHealthDay(day), metric, value);
        return persist(
          () => repositories.health.upsert(updated),
          (current) => ({ ...current, health: upsertById(current.health, updated) }),
        );
      },

      exportData() {
        return exportAppData(repositories, now());
      },

      deleteAllData() {
        return persist(
          () => deleteAllData(repositories),
          () => emptyAppData,
        );
      },
    };
  }, [repositories, now, generateId, persist]);

  const value = useMemo<AppDataValue>(
    () => ({ status, data, today: toIsoDay(now()), clock: now, actions }),
    [status, data, now, actions],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside an AppDataProvider');
  return value;
}
