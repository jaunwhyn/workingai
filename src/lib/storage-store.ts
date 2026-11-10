import { useSyncExternalStore } from "react";

/**
 * Tiny browser-storage backed store. Server render and hydration see `initial`,
 * then the client snapshot takes over, so there is no hydration mismatch.
 */
export function createStorageStore<T>(key: string, area: "local" | "session", initial: T) {
  const listeners = new Set<() => void>();
  let cache: T | undefined;

  const storage = () => {
    if (typeof window === "undefined") return null;
    try {
      return area === "local" ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  };

  const read = (): T => {
    if (cache !== undefined) return cache;
    const s = storage();
    if (!s) return initial;
    try {
      const raw = s.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      cache = initial;
    }
    return cache;
  };

  const set = (next: T | ((prev: T) => T)) => {
    const value = typeof next === "function" ? (next as (prev: T) => T)(read()) : next;
    cache = value;
    try {
      storage()?.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable: keep in memory */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useValue = () => useSyncExternalStore(subscribe, read, () => initial);

  return { get: read, set, subscribe, useValue, reset: () => set(initial) };
}
