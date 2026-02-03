import React, { createContext, useCallback, useContext, useState } from 'react';

interface FavoritesRefreshContextValue {
  refreshTrigger: number;
  incrementRefresh: () => void;
}

const FavoritesRefreshContext = createContext<FavoritesRefreshContextValue | null>(null);

export function FavoritesRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const incrementRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <FavoritesRefreshContext.Provider value={{ refreshTrigger, incrementRefresh }}>
      {children}
    </FavoritesRefreshContext.Provider>
  );
}

export function useFavoritesRefresh() {
  const ctx = useContext(FavoritesRefreshContext);
  if (!ctx) {
    return { refreshTrigger: 0, incrementRefresh: () => {} };
  }
  return ctx;
}
