import * as Location from "expo-location";

import { stompEngine } from "@/lib/stomp/stomp-engine";
import type { GpsSample } from "@/lib/stomp/stomp-rules";

export function toGpsSample(location: Location.LocationObject): GpsSample {
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    accuracy: location.coords.accuracy,
    timestamp: location.timestamp,
  };
}

export type ForegroundTrackingMode = "passive" | "walk" | "run";

const WATCH_OPTIONS: Record<
  ForegroundTrackingMode,
  Location.LocationOptions
> = {
  passive: {
    accuracy: Location.Accuracy.High,
    distanceInterval: 5,
    timeInterval: 3000,
  },
  walk: {
    accuracy: Location.Accuracy.High,
    distanceInterval: 8,
    timeInterval: 4000,
  },
  run: {
    accuracy: Location.Accuracy.High,
    distanceInterval: 5,
    timeInterval: 2000,
  },
};

let subscription: Location.LocationSubscription | null = null;
let activeMode: ForegroundTrackingMode = "passive";
const positionListeners = new Set<(loc: Location.LocationObject) => void>();

export const locationService = {
  async requestForegroundPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  },

  async hasForegroundPermission(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === "granted";
  },

  async startForegroundWatch(mode: ForegroundTrackingMode = "passive"): Promise<void> {
    activeMode = mode;
    if (subscription) return;
    subscription = await Location.watchPositionAsync(
      WATCH_OPTIONS[mode],
      (location) => {
        stompEngine.processSample(toGpsSample(location));
        positionListeners.forEach((fn) => fn(location));
      },
    );
  },

  stopForegroundWatch(): void {
    subscription?.remove();
    subscription = null;
  },

  async setForegroundMode(mode: ForegroundTrackingMode): Promise<void> {
    if (mode === activeMode) return;
    activeMode = mode;
    if (!subscription) return;
    this.stopForegroundWatch();
    await this.startForegroundWatch(mode);
  },

  onPosition(listener: (loc: Location.LocationObject) => void): () => void {
    positionListeners.add(listener);
    return () => positionListeners.delete(listener);
  },

  async getCurrentPosition(): Promise<Location.LocationObject | null> {
    try {
      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    } catch {
      return null;
    }
  },
};
