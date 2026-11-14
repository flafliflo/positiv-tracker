import { AsyncStorageCollection, type KeyValueStorage } from '@/data/async-storage-collection';
import type { Collection } from '@/data/collection';
import { InMemoryCollection } from '@/data/in-memory-collection';
import type { Habit, HabitCheck } from '@/features/habits/domain/habit';
import type { HealthDay } from '@/features/health/domain/health-day';
import type { JournalEntry } from '@/features/journal/domain/journal-entry';
import type { AppData } from '@/features/progress/domain/stats';
import type { Win } from '@/features/wins/domain/win';

/** Alle Datenquellen der App. Wer den Speicherort wechseln will, tauscht nur diese Adapter. */
export type Repositories = {
  wins: Collection<Win>;
  journal: Collection<JournalEntry>;
  habits: Collection<Habit>;
  habitChecks: Collection<HabitCheck>;
  health: Collection<HealthDay>;
};

const PREFIX = 'positiv-tracker';

/** Speichert alles lokal auf dem Gerät – nichts verlässt das Gerät. */
export function createDeviceRepositories(storage: KeyValueStorage): Repositories {
  return {
    wins: new AsyncStorageCollection(storage, `${PREFIX}/wins/v1`),
    journal: new AsyncStorageCollection(storage, `${PREFIX}/journal/v1`),
    habits: new AsyncStorageCollection(storage, `${PREFIX}/habits/v1`),
    habitChecks: new AsyncStorageCollection(storage, `${PREFIX}/habit-checks/v1`),
    health: new AsyncStorageCollection(storage, `${PREFIX}/health/v1`),
  };
}

/** Für Tests: flüchtig, optional mit Startdaten. */
export function createInMemoryRepositories(seed: Partial<AppData> = {}): Repositories {
  return {
    wins: new InMemoryCollection(seed.wins),
    journal: new InMemoryCollection(seed.journal),
    habits: new InMemoryCollection(seed.habits),
    habitChecks: new InMemoryCollection(seed.habitChecks),
    health: new InMemoryCollection(seed.health),
  };
}

export async function loadAppData(repositories: Repositories): Promise<AppData> {
  const [wins, journal, habits, habitChecks, health] = await Promise.all([
    repositories.wins.list(),
    repositories.journal.list(),
    repositories.habits.list(),
    repositories.habitChecks.list(),
    repositories.health.list(),
  ]);
  return { wins, journal, habits, habitChecks, health };
}

/** Export-Format für die Datenportabilität (DSG/DSGVO): alles in einem JSON-Dokument. */
export type ExportDocument = {
  app: 'positiv-tracker';
  formatVersion: 1;
  exportedAt: string;
  data: AppData;
};

export async function exportAppData(repositories: Repositories, exportedAt: Date): Promise<ExportDocument> {
  return {
    app: 'positiv-tracker',
    formatVersion: 1,
    exportedAt: exportedAt.toISOString(),
    data: await loadAppData(repositories),
  };
}

export async function deleteAllData(repositories: Repositories): Promise<void> {
  await Promise.all(Object.values(repositories).map((collection) => collection.clear()));
}
