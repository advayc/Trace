export type ActivityType = "walk" | "run" | "passive";

export interface ActivityRoutePoint {
  latitude: number;
  longitude: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  startedAt: number;
  endedAt: number;
  distanceM: number;
  durationMs: number;
  avgPaceSPerKm: number | null;
  activeCaloriesKcal: number | null;
  avgHeartRateBpm: number | null;
  newTiles: number;
  reclaimedTiles: number;
  route: ActivityRoutePoint[];
}

export interface ActiveSession {
  id: string;
  type: Exclude<ActivityType, "passive">;
  startedAt: number;
  distanceM: number;
  durationMs: number;
  avgPaceSPerKm: number | null;
  activeCaloriesKcal: number | null;
  avgHeartRateBpm: number | null;
  newTiles: number;
  reclaimedTiles: number;
}
