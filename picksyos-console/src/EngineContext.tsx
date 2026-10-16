import { createContext, useContext } from 'react';
import type { ConsoleEngine } from './domain/engine';

export const EngineContext = createContext<ConsoleEngine | null>(null);

export function useEngine(): ConsoleEngine {
  const e = useContext(EngineContext);
  if (!e) throw new Error('useEngine must be used inside <EngineContext.Provider>');
  return e;
}
