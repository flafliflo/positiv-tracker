import { sortNewestFirst, type Win } from '../domain/win';
import type { WinRepository } from './win-repository';

export const WINS_STORAGE_KEY = 'positiv-tracker/wins/v1';

/** Der Teil von AsyncStorage, den wir brauchen (im Web steckt localStorage dahinter). */
export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

/** Speichert Wins lokal auf dem Gerät – nichts verlässt das Gerät. */
export class AsyncStorageWinRepository implements WinRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  async list(): Promise<Win[]> {
    return sortNewestFirst(await this.read());
  }

  async add(win: Win): Promise<void> {
    const wins = await this.read();
    await this.storage.setItem(WINS_STORAGE_KEY, JSON.stringify([...wins, win]));
  }

  private async read(): Promise<Win[]> {
    const raw = await this.storage.getItem(WINS_STORAGE_KEY);
    if (raw === null) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Win[]) : [];
    } catch {
      return [];
    }
  }
}
