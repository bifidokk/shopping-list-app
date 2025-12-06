import { useState, useCallback, useEffect } from 'react';

let activeListIdGlobal: string | null = null;
const listeners = new Set<(id: string | null) => void>();

export function useAppState() {
  const [activeListId, setActiveListIdState] = useState<string | null>(activeListIdGlobal);

  const setActiveListId = useCallback((id: string | null) => {
    activeListIdGlobal = id;
    listeners.forEach(listener => listener(id));
  }, []);

  useEffect(() => {
    const listener = (id: string | null) => setActiveListIdState(id);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { activeListId, setActiveListId };
}