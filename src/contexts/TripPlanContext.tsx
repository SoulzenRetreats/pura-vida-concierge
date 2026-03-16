import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface TripPlanContextType {
  planItems: string[];
  planCount: number;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isInPlan: (id: string) => boolean;
  conciergeId: string | null;
  conciergeSlug: string | null;
  setConcierge: (id: string, slug: string) => void;
  clearConcierge: () => void;
}

const TripPlanContext = createContext<TripPlanContextType | undefined>(undefined);

const STORAGE_KEY = "tripPlan";
const CONCIERGE_KEY = "tripPlanConcierge";

interface StoredConcierge {
  id: string;
  slug: string;
}

function loadFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function loadConciergeFromStorage(): StoredConcierge | null {
  try {
    const stored = localStorage.getItem(CONCIERGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.id && parsed?.slug) return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export function TripPlanProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Set<string>>(() => new Set(loadFromStorage()));
  const [concierge, setConciergeState] = useState<StoredConcierge | null>(() => loadConciergeFromStorage());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...items]));
  }, [items]);

  useEffect(() => {
    if (concierge) {
      localStorage.setItem(CONCIERGE_KEY, JSON.stringify(concierge));
    } else {
      localStorage.removeItem(CONCIERGE_KEY);
    }
  }, [concierge]);

  const toggle = useCallback((id: string) => {
    setItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems(new Set());
    setConciergeState(null);
  }, []);

  const isInPlan = useCallback((id: string) => items.has(id), [items]);

  const setConcierge = useCallback((id: string, slug: string) => {
    setConciergeState({ id, slug });
  }, []);

  const clearConcierge = useCallback(() => {
    setConciergeState(null);
  }, []);

  const planItems = [...items];

  return (
    <TripPlanContext.Provider
      value={{
        planItems,
        planCount: planItems.length,
        toggle,
        remove,
        clear,
        isInPlan,
        conciergeId: concierge?.id ?? null,
        conciergeSlug: concierge?.slug ?? null,
        setConcierge,
        clearConcierge,
      }}
    >
      {children}
    </TripPlanContext.Provider>
  );
}

export function useTripPlan() {
  const ctx = useContext(TripPlanContext);
  if (!ctx) throw new Error("useTripPlan must be used within TripPlanProvider");
  return ctx;
}
