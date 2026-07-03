import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";

import { runMigrations } from "@/lib/storage/migrations";

export interface StompedTile {
  h3Index: string;
  firstStompedAt: number;
  lastStompedAt: number;
  visitCount: number;
  lat: number;
  lng: number;
}

export interface DailyStat {
  day: string;
  distanceM: number;
  newTiles: number;
}

interface TileRow {
  h3_index: string;
  first_stomped_at: number;
  last_stomped_at: number;
  visit_count: number;
  lat: number;
  lng: number;
}

function rowToTile(row: TileRow): StompedTile {
  return {
    h3Index: row.h3_index,
    firstStompedAt: row.first_stomped_at,
    lastStompedAt: row.last_stomped_at,
    visitCount: row.visit_count,
    lat: row.lat,
    lng: row.lng,
  };
}

let db: SQLiteDatabase | null = null;

export function getDb(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync("trace.db");
    db.execSync("PRAGMA journal_mode = WAL;");
    runMigrations(db);
  }
  return db;
}

export function localDay(timestamp: number): string {
  const d = new Date(timestamp);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export type StompResult =
  | { kind: "new"; tile: StompedTile }
  | { kind: "revisit"; tile: StompedTile; dormantMs: number }
  | { kind: "unchanged" };

/** Revisits count at most once per cooldown window per tile. */
const REVISIT_COOLDOWN_MS = 5 * 60 * 1000;

export const tileRepository = {
  stomp(h3Index: string, lat: number, lng: number, at: number): StompResult {
    const database = getDb();
    const existing = database.getFirstSync<TileRow>(
      "SELECT * FROM stomped_tiles WHERE h3_index = ?",
      [h3Index],
    );

    if (!existing) {
      database.runSync(
        `INSERT INTO stomped_tiles (h3_index, first_stomped_at, last_stomped_at, visit_count, lat, lng)
         VALUES (?, ?, ?, 1, ?, ?)`,
        [h3Index, at, at, lat, lng],
      );
      database.runSync(
        `INSERT INTO daily_stats (day, distance_m, new_tiles) VALUES (?, 0, 1)
         ON CONFLICT(day) DO UPDATE SET new_tiles = new_tiles + 1`,
        [localDay(at)],
      );
      return {
        kind: "new",
        tile: {
          h3Index,
          firstStompedAt: at,
          lastStompedAt: at,
          visitCount: 1,
          lat,
          lng,
        },
      };
    }

    if (at - existing.last_stomped_at < REVISIT_COOLDOWN_MS) {
      return { kind: "unchanged" };
    }

    const dormantMs = at - existing.last_stomped_at;
    database.runSync(
      "UPDATE stomped_tiles SET visit_count = visit_count + 1, last_stomped_at = ? WHERE h3_index = ?",
      [at, h3Index],
    );
    return {
      kind: "revisit",
      tile: rowToTile({
        ...existing,
        visit_count: existing.visit_count + 1,
        last_stomped_at: at,
      }),
      dormantMs,
    };
  },

  addDistance(meters: number, at: number): void {
    getDb().runSync(
      `INSERT INTO daily_stats (day, distance_m, new_tiles) VALUES (?, ?, 0)
       ON CONFLICT(day) DO UPDATE SET distance_m = distance_m + excluded.distance_m`,
      [localDay(at), meters],
    );
  },

  tilesInBBox(
    north: number,
    south: number,
    east: number,
    west: number,
    limit: number,
  ): StompedTile[] {
    const rows = getDb().getAllSync<TileRow>(
      `SELECT * FROM stomped_tiles
       WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?
       LIMIT ?`,
      [south, north, west, east, limit],
    );
    return rows.map(rowToTile);
  },

  totalTiles(): number {
    const row = getDb().getFirstSync<{ n: number }>(
      "SELECT COUNT(*) AS n FROM stomped_tiles",
    );
    return row?.n ?? 0;
  },

  totalDistanceM(): number {
    const row = getDb().getFirstSync<{ d: number | null }>(
      "SELECT SUM(distance_m) AS d FROM daily_stats",
    );
    return row?.d ?? 0;
  },

  /** Distinct local days with at least one new tile, newest first. */
  activeDays(): string[] {
    const rows = getDb().getAllSync<{ day: string }>(
      "SELECT day FROM daily_stats WHERE new_tiles > 0 ORDER BY day DESC",
    );
    return rows.map((r) => r.day);
  },

  todayStats(now: number): DailyStat {
    const row = getDb().getFirstSync<{
      day: string;
      distance_m: number;
      new_tiles: number;
    }>("SELECT * FROM daily_stats WHERE day = ?", [localDay(now)]);
    return {
      day: localDay(now),
      distanceM: row?.distance_m ?? 0,
      newTiles: row?.new_tiles ?? 0,
    };
  },

  maxNewTilesInADay(): number {
    const row = getDb().getFirstSync<{ m: number | null }>(
      "SELECT MAX(new_tiles) AS m FROM daily_stats",
    );
    return row?.m ?? 0;
  },

  maxDistanceInADayM(): number {
    const row = getDb().getFirstSync<{ m: number | null }>(
      "SELECT MAX(distance_m) AS m FROM daily_stats",
    );
    return row?.m ?? 0;
  },

  /** Last N calendar days of activity, oldest first. Missing days are zero-filled. */
  recentDailyStats(days: number, now = Date.now()): DailyStat[] {
    const end = localDay(now);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (days - 1));
    const start = localDay(startDate.getTime());

    const rows = getDb().getAllSync<{
      day: string;
      distance_m: number;
      new_tiles: number;
    }>(
      "SELECT day, distance_m, new_tiles FROM daily_stats WHERE day >= ? AND day <= ? ORDER BY day ASC",
      [start, end],
    );
    const byDay = new Map(
      rows.map((row) => [
        row.day,
        {
          day: row.day,
          distanceM: row.distance_m,
          newTiles: row.new_tiles,
        } satisfies DailyStat,
      ]),
    );

    const result: DailyStat[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (days - 1 - i));
      const day = localDay(d.getTime());
      result.push(byDay.get(day) ?? { day, distanceM: 0, newTiles: 0 });
    }
    return result;
  },

  /** Recent tiles for revisit-intensity visualization (no h3 indexes exposed). */
  recentTileVisits(limit: number): { visitCount: number }[] {
    const rows = getDb().getAllSync<{ visit_count: number }>(
      "SELECT visit_count FROM stomped_tiles ORDER BY last_stomped_at DESC LIMIT ?",
      [limit],
    );
    return rows.map((row) => ({ visitCount: row.visit_count }));
  },

  clearAll(): void {
    const database = getDb();
    database.execSync(
      "DELETE FROM stomped_tiles; DELETE FROM daily_stats; DELETE FROM activities; DELETE FROM segment_prs;",
    );
  },
};
