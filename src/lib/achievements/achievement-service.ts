import { ACHIEVEMENTS, type AchievementDef } from "@/lib/achievements/definitions";
import type { TraceStats } from "@/lib/stats/stats-service";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

export function getUnlockedIds(): string[] {
  return settings.get<string[]>(SETTINGS_KEYS.unlockedAchievements, []);
}

/**
 * Evaluates achievements against fresh stats, persists new unlocks, and
 * returns the newly unlocked definitions (for celebration UI).
 */
export function evaluateAchievements(stats: TraceStats): AchievementDef[] {
  const unlocked = new Set(getUnlockedIds());
  const fresh = ACHIEVEMENTS.filter(
    (a) => !unlocked.has(a.id) && a.check(stats),
  );
  if (fresh.length > 0) {
    settings.set(SETTINGS_KEYS.unlockedAchievements, [
      ...unlocked,
      ...fresh.map((a) => a.id),
    ]);
  }
  return fresh;
}

export function resetAchievements(): void {
  settings.set(SETTINGS_KEYS.unlockedAchievements, []);
}
