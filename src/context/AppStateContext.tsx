import { createContext, useContext, useState, type ReactNode } from 'react';

interface AppStateContextValue {
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [activeListId, setActiveListId] = useState<string | null>(null);

  return (
    <AppStateContext.Provider value={{ activeListId, setActiveListId }}>
      {children}
    </AppStateContext.Provider>
  );
}
