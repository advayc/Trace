import { useSyncExternalStore } from "react";

import { settings } from "@/lib/storage/settings";

export function useSetting<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const raw = useSyncExternalStore(
    (cb) => settings.subscribe(key, cb),
    () => globalThis.localStorage.getItem(key),
  );
  const value = raw == null ? defaultValue : safeParse<T>(raw, defaultValue);
  return [value, (newValue: T) => settings.set(key, newValue)];
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
