import type { SQLiteDatabase } from "expo-sqlite";

/** Append-only. Never edit a migration that has shipped. */
const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS stomped_tiles (
    h3_index TEXT PRIMARY KEY,
    first_stomped_at INTEGER NOT NULL,
    last_stomped_at INTEGER NOT NULL,
    visit_count INTEGER NOT NULL DEFAULT 1,
    lat REAL NOT NULL,
    lng REAL NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_tiles_lat_lng ON stomped_tiles(lat, lng);
  CREATE TABLE IF NOT EXISTS daily_stats (
    day TEXT PRIMARY KEY,
    distance_m REAL NOT NULL DEFAULT 0,
    new_tiles INTEGER NOT NULL DEFAULT 0
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('walk', 'run', 'passive')),
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    distance_m REAL NOT NULL DEFAULT 0,
    duration_ms INTEGER,
    avg_pace_s_per_km REAL,
    new_tiles INTEGER NOT NULL DEFAULT 0,
    reclaimed_tiles INTEGER NOT NULL DEFAULT 0,
    route_json TEXT NOT NULL DEFAULT '[]'
  );
  CREATE INDEX IF NOT EXISTS idx_activities_ended_at ON activities(ended_at DESC);
  `,
  `
  CREATE TABLE IF NOT EXISTS segment_prs (
    segment_id TEXT PRIMARY KEY,
    elapsed_ms INTEGER NOT NULL,
    activity_id TEXT NOT NULL,
    achieved_at INTEGER NOT NULL
  );
  `,
];

export function runMigrations(db: SQLiteDatabase): void {
  const row = db.getFirstSync<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.withTransactionSync(() => {
      db.execSync(MIGRATIONS[v]);
      db.execSync(`PRAGMA user_version = ${v + 1}`);
    });
  }
}
