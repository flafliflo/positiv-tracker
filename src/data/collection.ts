/**
 * Port (Adapter-Pattern): eine Sammlung gleichartiger Datensätze mit ID.
 * Die App kennt nur dieses Interface, nicht den Speicherort. Heute: Gerätespeicher.
 * Später austauschbar gegen ein Backend mit Login und Row Level Security.
 */
export interface Collection<T extends { id: string }> {
  list(): Promise<T[]>;
  /** Fügt den Datensatz hinzu oder ersetzt den mit derselben ID. */
  upsert(item: T): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}
