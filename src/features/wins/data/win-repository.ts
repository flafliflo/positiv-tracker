import type { Win } from '../domain/win';

/**
 * Port (Adapter-Pattern): Die UI kennt nur dieses Interface, nicht den Speicherort.
 * Heute: Gerätespeicher. Später austauschbar gegen ein Backend mit Login und
 * Row Level Security – ohne Änderungen an UI oder Domäne.
 */
export interface WinRepository {
  /** Alle Wins, neueste zuerst. */
  list(): Promise<Win[]>;
  add(win: Win): Promise<void>;
}
