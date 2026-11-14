/** Uhr und ID-Erzeugung werden übergeben, damit Tests deterministisch sind. */
export type DomainDeps = { now: () => Date; generateId: () => string };
