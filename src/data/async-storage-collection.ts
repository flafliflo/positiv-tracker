import type { Collection } from './collection';

/** Der Teil von AsyncStorage, den wir brauchen (im Web steckt localStorage dahinter). */
export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

/**
 * Speichert eine Sammlung als JSON-Liste unter einem Schlüssel – lokal auf dem Gerät.
 * Schreibzugriffe laufen nacheinander (Warteschlange), damit zwei gleichzeitige
 * Änderungen sich nicht gegenseitig überschreiben.
 */
export class AsyncStorageCollection<T extends { id: string }> implements Collection<T> {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly key: string,
  ) {}

  list(): Promise<T[]> {
    return this.read();
  }

  upsert(item: T): Promise<void> {
    return this.change((items) => {
      const exists = items.some((existing) => existing.id === item.id);
      return exists ? items.map((existing) => (existing.id === item.id ? item : existing)) : [...items, item];
    });
  }

  remove(id: string): Promise<void> {
    return this.change((items) => items.filter((item) => item.id !== id));
  }

  clear(): Promise<void> {
    return this.enqueue(() => this.storage.removeItem(this.key));
  }

  private change(update: (items: T[]) => T[]): Promise<void> {
    return this.enqueue(async () => {
      const items = await this.read();
      await this.storage.setItem(this.key, JSON.stringify(update(items)));
    });
  }

  private enqueue(task: () => Promise<void>): Promise<void> {
    const result = this.queue.then(task, task);
    this.queue = result.catch(() => {});
    return result;
  }

  private async read(): Promise<T[]> {
    const raw = await this.storage.getItem(this.key);
    if (raw === null) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
}
