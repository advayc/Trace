import Constants from "expo-constants";
import { Platform } from "react-native";

import type { Activity, ActivityType } from "@/lib/activity/activity-types";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

type ExpoHealthKitModule = typeof import("@kayzmann/expo-healthkit");

let healthKitModule: ExpoHealthKitModule | null | undefined;

function getHealthKit(): ExpoHealthKitModule | null {
  if (Platform.OS !== "ios") return null;
  if (Constants.executionEnvironment === "storeClient") return null;
  if (healthKitModule !== undefined) return healthKitModule;

  try {
    healthKitModule = require("@kayzmann/expo-healthkit") as ExpoHealthKitModule;
  } catch {
    healthKitModule = null;
  }

  return healthKitModule;
}

export interface HealthWorkout {
  activityId: string;
  type: Activity["type"];
  startedAt: number;
  endedAt: number;
  distanceM: number;
  durationMs: number;
}

export interface WorkoutMetrics {
  activeCaloriesKcal: number | null;
  avgHeartRateBpm: number | null;
}

export interface HealthService {
  isAvailable(): Promise<boolean>;
  isEnabled(): boolean;
  enable(): Promise<boolean>;
  disable(): void;
  readTodaySteps(): Promise<number | null>;
  writeWorkout(activity: Activity): Promise<void>;
  fetchWorkoutMetrics(startedAt: number, endedAt: number): Promise<WorkoutMetrics>;
  pollLiveMetrics(startedAt: number): Promise<WorkoutMetrics>;
}

function healthKitActivityType(type: ActivityType): "running" | "walking" {
  return type === "run" ? "running" : "walking";
}

function estimateCalories(type: ActivityType, durationMs: number): number {
  const met = type === "run" ? 9.8 : 3.5;
  const hours = durationMs / 3_600_000;
  return Math.round(met * 70 * hours);
}

function averageHeartRate(
  samples: { value: number }[],
): number | null {
  if (samples.length === 0) return null;
  const total = samples.reduce((sum, sample) => sum + sample.value, 0);
  return Math.round(total / samples.length);
}

async function authorize(): Promise<boolean> {
  const ExpoHealthKit = getHealthKit();
  if (!ExpoHealthKit) return false;
  try {
    if (!ExpoHealthKit.isAvailable()) return false;
    await ExpoHealthKit.requestAuthorization(
      ["Workout", "Steps", "ActiveEnergy", "HeartRate", "Distance"],
      ["Workout", "ActiveEnergy", "Distance"],
    );
    return true;
  } catch {
    return false;
  }
}

export const healthService: HealthService = {
  async isAvailable() {
    const ExpoHealthKit = getHealthKit();
    if (!ExpoHealthKit) return false;
    try {
      return ExpoHealthKit.isAvailable();
    } catch {
      return false;
    }
  },

  isEnabled() {
    return settings.get(SETTINGS_KEYS.appleHealthEnabled, false);
  },

  async enable() {
    const ok = await authorize();
    if (ok) settings.set(SETTINGS_KEYS.appleHealthEnabled, true);
    return ok;
  },

  disable() {
    settings.set(SETTINGS_KEYS.appleHealthEnabled, false);
  },

  async readTodaySteps() {
    const ExpoHealthKit = getHealthKit();
    if (!this.isEnabled() || !ExpoHealthKit) return null;
    try {
      if (!ExpoHealthKit.isAvailable()) return null;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return Math.round(await ExpoHealthKit.getSteps(start, new Date()));
    } catch {
      return null;
    }
  },

  async writeWorkout(activity) {
    const ExpoHealthKit = getHealthKit();
    if (!this.isEnabled() || !ExpoHealthKit || activity.type === "passive") {
      return;
    }
    try {
      if (!ExpoHealthKit.isAvailable()) return;
      const calories =
        activity.activeCaloriesKcal ??
        estimateCalories(activity.type, activity.durationMs);
      await ExpoHealthKit.saveWorkout({
        startDate: activity.startedAt,
        endDate: activity.endedAt,
        duration: activity.durationMs / 1000,
        distance: activity.distanceM,
        calories,
        activityType: healthKitActivityType(activity.type),
        metadata: { source: "Trace", activityId: activity.id },
      });
    } catch {
      // Health sync is best-effort.
    }
  },

  async fetchWorkoutMetrics(startedAt, endedAt) {
    const ExpoHealthKit = getHealthKit();
    if (!this.isEnabled() || !ExpoHealthKit) {
      return { activeCaloriesKcal: null, avgHeartRateBpm: null };
    }
    try {
      if (!ExpoHealthKit.isAvailable()) {
        return { activeCaloriesKcal: null, avgHeartRateBpm: null };
      }
      const start = new Date(startedAt);
      const end = new Date(endedAt);
      const [calories, heartRates] = await Promise.all([
        ExpoHealthKit.getTotalCalories(start, end),
        ExpoHealthKit.getHeartRateSamples(start, end),
      ]);
      return {
        activeCaloriesKcal: calories > 0 ? Math.round(calories) : null,
        avgHeartRateBpm: averageHeartRate(heartRates),
      };
    } catch {
      return { activeCaloriesKcal: null, avgHeartRateBpm: null };
    }
  },

  async pollLiveMetrics(startedAt) {
    return this.fetchWorkoutMetrics(startedAt, Date.now());
  },
};
