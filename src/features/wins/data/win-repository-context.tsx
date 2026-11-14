import { createContext, useContext, type ReactNode } from 'react';

import type { WinRepository } from './win-repository';

const WinRepositoryContext = createContext<WinRepository | null>(null);

/** Stellt der UI die gewählte Datenquelle bereit (Dependency Injection über React Context). */
export function WinRepositoryProvider({
  value,
  children,
}: {
  value: WinRepository;
  children: ReactNode;
}) {
  return <WinRepositoryContext.Provider value={value}>{children}</WinRepositoryContext.Provider>;
}

export function useWinRepository(): WinRepository {
  const repository = useContext(WinRepositoryContext);
  if (!repository) {
    throw new Error('useWinRepository must be used inside a WinRepositoryProvider');
  }
  return repository;
}
