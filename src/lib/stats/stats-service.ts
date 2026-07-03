import { AVG_CELL_AREA_KM2 } from "@/lib/h3";
import { localDay, tileRepository } from "@/lib/storage/tile-db";
import { bestStreak, currentStreak } from "@/lib/stats/streaks";

export interface TraceStats {
  totalTiles: number;
  areaKm2: number;
  distanceM: number;
  activeDays: number;
  currentStreak: number;
  bestStreak: number;
  todayNewTiles: number;
  todayDistanceM: number;
  maxTilesInADay: number;
  maxDistanceInADayM: number;
}

export function computeStats(now = Date.now()): TraceStats {
  const totalTiles = tileRepository.totalTiles();
  const activeDaysDesc = tileRepository.activeDays();
  const today = tileRepository.todayStats(now);

  return {
    totalTiles,
    areaKm2: totalTiles * AVG_CELL_AREA_KM2,
    distanceM: tileRepository.totalDistanceM(),
    activeDays: activeDaysDesc.length,
    currentStreak: currentStreak(activeDaysDesc, localDay(now)),
    bestStreak: bestStreak(activeDaysDesc),
    todayNewTiles: today.newTiles,
    todayDistanceM: today.distanceM,
    maxTilesInADay: tileRepository.maxNewTilesInADay(),
    maxDistanceInADayM: tileRepository.maxDistanceInADayM(),
  };
}

/** Approximate coverage of a bounding box: stomped cells / cells that fit in it. */
export function coverageFraction(
  north: number,
  south: number,
  east: number,
  west: number,
  totalCellsInBox: number,
): number {
  if (totalCellsInBox <= 0) return 0;
  const stomped = tileRepository.tilesInBBox(
    north,
    south,
    east,
    west,
    totalCellsInBox,
  ).length;
  return Math.min(1, stomped / totalCellsInBox);
}
