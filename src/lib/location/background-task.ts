import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { toGpsSample } from "@/lib/location/location-service";
import { stompEngine } from "@/lib/stomp/stomp-engine";

export const BACKGROUND_LOCATION_TASK = "trace-background-location";

// Must run at module top level so the task exists when iOS relaunches the
// app headlessly. This module is imported for its side effect from the root layout.
TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }) => {
    if (error || !data?.locations) return;
    for (const location of data.locations) {
      stompEngine.processSample(toGpsSample(location));
    }
  },
);

export async function isBackgroundTrackingActive(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK,
    );
  } catch {
    return false;
  }
}

/** Opt-in only. Requests "Always" permission at toggle time, never before. */
export async function startBackgroundTracking(): Promise<
  "started" | "denied-foreground" | "denied-background"
> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") return "denied-foreground";
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== "granted") return "denied-background";

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    distanceInterval: 15,
    deferredUpdatesInterval: 30000,
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: true,
    activityType: Location.ActivityType.Fitness,
    foregroundService: {
      notificationTitle: "Trace is revealing tiles",
      notificationBody: "Your walk is clearing fog on your map.",
      notificationColor: "#C8533C",
    },
  });
  return "started";
}

export async function stopBackgroundTracking(): Promise<void> {
  if (await isBackgroundTrackingActive()) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}
