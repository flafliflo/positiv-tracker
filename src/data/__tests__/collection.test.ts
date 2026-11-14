import AsyncStorage from '@react-native-async-storage/async-storage';

import { AsyncStorageCollection } from '../async-storage-collection';
import type { Collection } from '../collection';
import { InMemoryCollection } from '../in-memory-collection';

type Item = { id: string; text: string };
const KEY = 'test/items';

/**
 * Vertragstest: Jede Implementierung von Collection muss sich gleich verhalten.
 * So bleibt der Speicherort austauschbar (später z. B. ein Server-Backend).
 */
describe.each<[string, () => Collection<Item>]>([
  ['InMemoryCollection', () => new InMemoryCollection<Item>()],
  ['AsyncStorageCollection', () => new AsyncStorageCollection<Item>(AsyncStorage, KEY)],
])('%s', (_name, create) => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts empty', async () => {
    expect(await create().list()).toEqual([]);
  });

  it('adds new items', async () => {
    const collection = create();
    await collection.upsert({ id: 'a', text: 'A' });
    await collection.upsert({ id: 'b', text: 'B' });

    expect(await collection.list()).toEqual([
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ]);
  });

  it('replaces an item with the same id', async () => {
    const collection = create();
    await collection.upsert({ id: 'a', text: 'A' });
    await collection.upsert({ id: 'a', text: 'changed' });

    expect(await collection.list()).toEqual([{ id: 'a', text: 'changed' }]);
  });

  it('removes an item and ignores unknown ids', async () => {
    const collection = create();
    await collection.upsert({ id: 'a', text: 'A' });
    await collection.upsert({ id: 'b', text: 'B' });
    await collection.remove('a');
    await collection.remove('missing');

    expect(await collection.list()).toEqual([{ id: 'b', text: 'B' }]);
  });

  it('clears everything', async () => {
    const collection = create();
    await collection.upsert({ id: 'a', text: 'A' });
    await collection.clear();

    expect(await collection.list()).toEqual([]);
  });
});

describe('AsyncStorageCollection', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('keeps items across instances (e.g. after an app restart)', async () => {
    await new AsyncStorageCollection<Item>(AsyncStorage, KEY).upsert({ id: 'a', text: 'A' });

    expect(await new AsyncStorageCollection<Item>(AsyncStorage, KEY).list()).toEqual([{ id: 'a', text: 'A' }]);
  });

  it('treats corrupt stored data as empty instead of crashing', async () => {
    await AsyncStorage.setItem(KEY, 'not json');

    expect(await new AsyncStorageCollection<Item>(AsyncStorage, KEY).list()).toEqual([]);
  });

  it('does not lose items when two writes happen at the same time', async () => {
    const collection = new AsyncStorageCollection<Item>(AsyncStorage, KEY);
    await Promise.all([collection.upsert({ id: 'a', text: 'A' }), collection.upsert({ id: 'b', text: 'B' })]);

    expect((await collection.list()).map((item) => item.id).sort()).toEqual(['a', 'b']);
  });
});
