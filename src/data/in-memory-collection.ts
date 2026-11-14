import type { Collection } from './collection';

/** Flüchtige Implementierung für Tests und Prototypen. */
export class InMemoryCollection<T extends { id: string }> implements Collection<T> {
  private items: T[];

  constructor(initialItems: readonly T[] = []) {
    this.items = [...initialItems];
  }

  async list(): Promise<T[]> {
    return [...this.items];
  }

  async upsert(item: T): Promise<void> {
    const exists = this.items.some((existing) => existing.id === item.id);
    this.items = exists
      ? this.items.map((existing) => (existing.id === item.id ? item : existing))
      : [...this.items, item];
  }

  async remove(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async clear(): Promise<void> {
    this.items = [];
  }
}
