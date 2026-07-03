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

let subscription: Location.LocationSubscription | null = null;
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

  async startForegroundWatch(): Promise<void> {
    if (subscription) return;
    subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 3000,
      },
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
