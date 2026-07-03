---
name: trace-map-engine
description: Domain skill for Trace's map, H3 tile grid, location tracking, stomp engine, and SQLite storage. Use when working on anything under src/lib/ or src/components/map/, or when debugging GPS, fog rendering, or tile persistence.
---

# Trace Map Engine

## H3 grid

- Resolution **10** everywhere (~66 m hex edge, avg cell area ~0.0135 km²). Defined once as `H3_RESOLUTION` in `src/lib/h3/index.ts` — never hardcode elsewhere.
- `latLngToCell(lat, lng, H3_RESOLUTION)` converts GPS to a tile id.
- `cellToBoundary(index, true)` returns `[lng, lat]` pairs (GeoJSON order) — convert to `{latitude, longitude}` for react-native-maps polygons via `cellBoundaryToCoords` in `src/lib/h3/index.ts`.
- Viewport cells: `polygonToCells` over the visible region's bounding box. ALWAYS estimate cell count first (`bboxAreaKm2 / avgCellAreaKm2`) and bail out of fog-hex rendering when the estimate exceeds the budget — never call `polygonToCells` on a zoomed-out region.

## Performance budgets

- Max **~500 polygons** rendered per frame (fog + revealed combined).
- Region changes are debounced **150 ms** before recomputing viewport cells.
- When zoomed out past the fog budget (`latitudeDelta > ~0.06`), render revealed tiles only (capped) over the dark atmosphere overlay; skip fog hexes.
- Tile queries hit SQLite with an R-tree-style bounding box (`WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?`) backed by the `idx_tiles_lat_lng` index. Never `SELECT *` the whole table for rendering.

## SQLite schema (source of truth: src/lib/storage/tile-db.ts)

```sql
CREATE TABLE stomped_tiles (
  h3_index TEXT PRIMARY KEY,
  first_stomped_at INTEGER NOT NULL, -- epoch ms
  last_stomped_at INTEGER NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 1,
  lat REAL NOT NULL,  -- cell center, local rendering only
  lng REAL NOT NULL
);
CREATE INDEX idx_tiles_lat_lng ON stomped_tiles(lat, lng);
CREATE TABLE daily_stats (
  day TEXT PRIMARY KEY,              -- YYYY-MM-DD local
  distance_m REAL NOT NULL DEFAULT 0,
  new_tiles INTEGER NOT NULL DEFAULT 0
);
```

- Migrations use `PRAGMA user_version` in `src/lib/storage/migrations.ts`; append new migrations, never edit shipped ones.
- Revisit heat comes from `visit_count`; a revisit increments it at most once per `REVISIT_COOLDOWN_MS` (5 min) per tile.
- Key-value settings/flags use the `expo-sqlite/localStorage` polyfill via `src/lib/storage/settings.ts` — never AsyncStorage.

## Stomp rules (pure functions, src/lib/stomp/stomp-rules.ts)

A sample is accepted only if ALL pass: `accuracy <= 50 m`; implied speed vs previous accepted sample `<= 25 km/h`; distance from previous accepted sample `>= 8 m` (first sample exempt from the last two). Rejected samples never touch the DB. Constants live in `STOMP_CONFIG` — tune there only.

## Location lifecycle

- Foreground: `watchPositionAsync` (`Accuracy.High`, `distanceInterval: 5`) started by the map screen through `src/lib/location/location-service.ts`; samples flow into `StompEngine.processSample`.
- Background: task name `trace-background-location`. `TaskManager.defineTask` MUST be called at module top level in `src/lib/location/background-task.ts`, which MUST be imported (side effect) from `src/app/_layout.tsx`. Toggled via `startLocationUpdatesAsync`/`stopLocationUpdatesAsync`; requires "Always" permission granted on opt-in only.
- `StompEngine` is a singleton event emitter; UI subscribes for `tile:new` (haptic + animation) and `stats:changed`.

## Testing movement in the iOS Simulator

```bash
xcrun simctl location booted set 40.7648,-73.9808   # jump to a point
# walk: issue successive `set` calls ~0.0002 lat apart every few seconds
```
