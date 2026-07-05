import "expo-sqlite/localStorage/install";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export const SETTINGS_KEYS = {
  onboarded: "trace.onboarded",
  units: "trace.units", // "mi" | "km"
  colorScheme: "trace.colorScheme", // "dark" | "light"
  accentPreset: "trace.accentPreset", // AccentPreset
  backgroundTracking: "trace.backgroundTracking",
  appleHealthEnabled: "trace.appleHealthEnabled",
  unlockedAchievements: "trace.unlockedAchievements", // string[] of ids
  deviceUserId: "trace.deviceUserId",
  liveActivityEnabled: "trace.liveActivityEnabled",
  achievementNotifications: "trace.achievementNotifications",
  sessionSummaryNotifications: "trace.sessionSummaryNotifications",
  dailyNudgeNotifications: "trace.dailyNudgeNotifications",
  lastAppOpenDate: "trace.lastAppOpenDate",
} as const;

export const settings = {
  get<T>(key: string, defaultValue: T): T {
    const value = globalThis.localStorage.getItem(key);
    if (value == null) return defaultValue;
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
    listeners.get(key)?.forEach((fn) => fn());
  },

  remove(key: string): void {
    globalThis.localStorage.removeItem(key);
    listeners.get(key)?.forEach((fn) => fn());
  },

  subscribe(key: string, listener: Listener): () => void {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(listener);
    return () => listeners.get(key)?.delete(listener);
  },
};

/** Stable local identity so services are auth-ready (swapped for a real user id in Phase 2). */
export function getDeviceUserId(): string {
  let id = settings.get<string | null>(SETTINGS_KEYS.deviceUserId, null);
  if (!id) {
    id = `device-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    settings.set(SETTINGS_KEYS.deviceUserId, id);
  }
  return id;
}

export function ensureDefaultSettings(): void {
  if (globalThis.localStorage.getItem(SETTINGS_KEYS.units) == null) {
    settings.set(SETTINGS_KEYS.units, "km");
  }
}
