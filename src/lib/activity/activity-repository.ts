import { getDb } from "@/lib/storage/tile-db";

import type { Activity, ActivityRoutePoint, ActivityType } from "@/lib/activity/activity-types";

interface ActivityRow {
  id: string;
  type: ActivityType;
  started_at: number;
  ended_at: number;
  distance_m: number;
  duration_ms: number;
  avg_pace_s_per_km: number | null;
  active_calories_kcal: number | null;
  avg_heart_rate_bpm: number | null;
  new_tiles: number;
  reclaimed_tiles: number;
  route_json: string;
}

interface ActivityInsert {
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

function rowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    type: row.type,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    distanceM: row.distance_m,
    durationMs: row.duration_ms,
    avgPaceSPerKm: row.avg_pace_s_per_km,
    activeCaloriesKcal: row.active_calories_kcal,
    avgHeartRateBpm: row.avg_heart_rate_bpm,
    newTiles: row.new_tiles,
    reclaimedTiles: row.reclaimed_tiles,
    route: parseRoute(row.route_json),
  };
}

function parseRoute(raw: string): ActivityRoutePoint[] {
  try {
    const parsed = JSON.parse(raw) as [number, number][];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((point) => {
        const latitude = Number(point?.[0]);
        const longitude = Number(point?.[1]);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        return { latitude, longitude };
      })
      .filter((point): point is ActivityRoutePoint => point !== null);
  } catch {
    return [];
  }
}

function serializeRoute(route: ActivityRoutePoint[]): string {
  return JSON.stringify(route.map((p) => [p.latitude, p.longitude]));
}

export const activityRepository = {
  saveCompleted(insert: ActivityInsert): void {
    getDb().runSync(
      `INSERT INTO activities (
        id,
        type,
        started_at,
        ended_at,
        distance_m,
        duration_ms,
        avg_pace_s_per_km,
        active_calories_kcal,
        avg_heart_rate_bpm,
        new_tiles,
        reclaimed_tiles,
        route_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insert.id,
        insert.type,
        insert.startedAt,
        insert.endedAt,
        insert.distanceM,
        insert.durationMs,
        insert.avgPaceSPerKm,
        insert.activeCaloriesKcal,
        insert.avgHeartRateBpm,
        insert.newTiles,
        insert.reclaimedTiles,
        serializeRoute(insert.route),
      ],
    );
  },

  latest(): Activity | null {
    const row = getDb().getFirstSync<ActivityRow>(
      "SELECT * FROM activities WHERE ended_at IS NOT NULL ORDER BY ended_at DESC LIMIT 1",
    );
    return row ? rowToActivity(row) : null;
  },

  recent(limit = 20): Activity[] {
    const rows = getDb().getAllSync<ActivityRow>(
      `SELECT * FROM activities
       WHERE ended_at IS NOT NULL
       ORDER BY ended_at DESC
       LIMIT ?`,
      [limit],
    );
    return rows.map(rowToActivity);
  },

  clearAll(): void {
    getDb().execSync("DELETE FROM activities;");
  },
};
