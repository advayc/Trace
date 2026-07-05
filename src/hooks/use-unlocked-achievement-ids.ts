import { useSyncExternalStore } from "react";

import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

export function useUnlockedAchievementIds(): string[] {
  const raw = useSyncExternalStore(
    (cb) => settings.subscribe(SETTINGS_KEYS.unlockedAchievements, cb),
    () => globalThis.localStorage.getItem(SETTINGS_KEYS.unlockedAchievements),
  );

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
