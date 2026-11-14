import { sortNewestFirst, type Win } from '../domain/win';
import type { WinRepository } from './win-repository';

/** Flüchtige Implementierung für Tests und Prototypen. */
export class InMemoryWinRepository implements WinRepository {
  private wins: Win[];

  constructor(initialWins: readonly Win[] = []) {
    this.wins = [...initialWins];
  }

  async list(): Promise<Win[]> {
    return sortNewestFirst(this.wins);
  }

  async add(win: Win): Promise<void> {
    this.wins.push(win);
  }
}
