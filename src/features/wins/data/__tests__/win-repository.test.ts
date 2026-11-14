import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Win } from '../../domain/win';
import { AsyncStorageWinRepository, WINS_STORAGE_KEY } from '../async-storage-win-repository';
import { InMemoryWinRepository } from '../in-memory-win-repository';
import type { WinRepository } from '../win-repository';

const older: Win = {
  id: 'a',
  text: 'Früh aufgestanden',
  category: 'mindset',
  day: '2026-11-13',
  createdAt: '2026-11-13T06:00:00.000Z',
};
const newer: Win = {
  id: 'b',
  text: 'Prüfung bestanden',
  category: 'learning',
  day: '2026-11-14',
  createdAt: '2026-11-14T15:00:00.000Z',
};

/**
 * Vertragstest: Jede Implementierung von WinRepository muss sich gleich verhalten.
 * So bleibt die Datenquelle austauschbar (später z. B. ein Server-Backend).
 */
describe.each<[string, () => WinRepository]>([
  ['InMemoryWinRepository', () => new InMemoryWinRepository()],
  ['AsyncStorageWinRepository', () => new AsyncStorageWinRepository(AsyncStorage)],
])('%s', (_name, createRepository) => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts empty', async () => {
    expect(await createRepository().list()).toEqual([]);
  });

  it('returns added wins, newest first', async () => {
    const repository = createRepository();
    await repository.add(older);
    await repository.add(newer);

    expect(await repository.list()).toEqual([newer, older]);
  });
});

describe('AsyncStorageWinRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('keeps wins across instances (e.g. after an app restart)', async () => {
    await new AsyncStorageWinRepository(AsyncStorage).add(older);

    expect(await new AsyncStorageWinRepository(AsyncStorage).list()).toEqual([older]);
  });

  it('treats corrupt stored data as empty instead of crashing', async () => {
    await AsyncStorage.setItem(WINS_STORAGE_KEY, 'not json');

    expect(await new AsyncStorageWinRepository(AsyncStorage).list()).toEqual([]);
  });
});
