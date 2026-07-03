import type { Activity } from "@/lib/activity/activity-types";

export interface HealthWorkout {
  activityId: string;
  type: Activity["type"];
  startedAt: number;
  endedAt: number;
  distanceM: number;
  durationMs: number;
}

export interface HealthService {
  isAvailable(): Promise<boolean>;
  readTodaySteps(): Promise<number | null>;
  writeWorkout(activity: Activity): Promise<void>;
}

/** Graceful no-op until HealthKit native module is integrated. */
export const healthService: HealthService = {
  async isAvailable() {
    return false;
  },

  async readTodaySteps() {
    return null;
  },

  async writeWorkout() {
    // HealthKit write deferred — interface ready for native bridge.
  },
};
