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
