import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface TripPlanContextType {
  planItems: string[];
  planCount: number;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isInPlan: (id: string) => boolean;
}

const TripPlanContext = createContext<TripPlanContextType | undefined>(undefined);

const STORAGE_KEY = "tripPlan";

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

export function TripPlanProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Set<string>>(() => new Set(loadFromStorage()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...items]));
  }, [items]);

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

  const clear = useCallback(() => setItems(new Set()), []);

  const isInPlan = useCallback((id: string) => items.has(id), [items]);

  const planItems = [...items];

  return (
    <TripPlanContext.Provider value={{ planItems, planCount: planItems.length, toggle, remove, clear, isInPlan }}>
      {children}
    </TripPlanContext.Provider>
  );
}

export function useTripPlan() {
  const ctx = useContext(TripPlanContext);
  if (!ctx) throw new Error("useTripPlan must be used within TripPlanProvider");
  return ctx;
}
