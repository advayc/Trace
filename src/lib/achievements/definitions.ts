import type { TraceStats } from "@/lib/stats/stats-service";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  /** SF Symbol name rendered via expo-image sf: source */
  sf: string;
  check: (stats: TraceStats) => boolean;
}

export interface AchievementProgress {
  current: number;
  target: number;
  fraction: number;
  label: string;
}

const MILE_M = 1609.344;

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-tile",
    title: "First Stomp",
    description: "Reveal your very first tile.",
    sf: "shoeprints.fill",
    check: (s) => s.totalTiles >= 1,
  },
  {
    id: "tiles-10",
    title: "Toe in the Fog",
    description: "Reveal 10 tiles.",
    sf: "hexagon.fill",
    check: (s) => s.totalTiles >= 10,
  },
  {
    id: "tiles-100",
    title: "Block Walker",
    description: "Reveal 100 tiles.",
    sf: "square.grid.3x3.fill",
    check: (s) => s.totalTiles >= 100,
  },
  {
    id: "tiles-1000",
    title: "Neighborhood Regular",
    description: "Reveal 1,000 tiles.",
    sf: "building.2.fill",
    check: (s) => s.totalTiles >= 1000,
  },
  {
    id: "tiles-10000",
    title: "City Cartographer",
    description: "Reveal 10,000 tiles.",
    sf: "map.fill",
    check: (s) => s.totalTiles >= 10000,
  },
  {
    id: "streak-3",
    title: "Warming Up",
    description: "Stomp new ground 3 days in a row.",
    sf: "flame",
    check: (s) => s.currentStreak >= 3 || s.bestStreak >= 3,
  },
  {
    id: "streak-7",
    title: "Week of Wander",
    description: "Stomp new ground 7 days in a row.",
    sf: "flame.fill",
    check: (s) => s.currentStreak >= 7 || s.bestStreak >= 7,
  },
  {
    id: "streak-30",
    title: "Relentless",
    description: "Stomp new ground 30 days in a row.",
    sf: "sparkles",
    check: (s) => s.currentStreak >= 30 || s.bestStreak >= 30,
  },
  {
    id: "day-1mi",
    title: "Mile Marker",
    description: "Cover 1 mile in a single day.",
    sf: "figure.walk",
    check: (s) => s.maxDistanceInADayM >= MILE_M,
  },
  {
    id: "day-5mi",
    title: "Long Hauler",
    description: "Cover 5 miles in a single day.",
    sf: "figure.hiking",
    check: (s) => s.maxDistanceInADayM >= 5 * MILE_M,
  },
  {
    id: "day-100-tiles",
    title: "Fog Storm",
    description: "Reveal 100 new tiles in a single day.",
    sf: "wind",
    check: (s) => s.maxTilesInADay >= 100,
  },
  {
    id: "distance-26",
    title: "Marathon Territory",
    description: "Cover 26.2 miles all-time.",
    sf: "medal.fill",
    check: (s) => s.distanceM >= 26.2 * MILE_M,
  },
];

function clampFraction(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(1, current / target);
}

export function getAchievementProgress(
  achievement: AchievementDef,
  stats: TraceStats,
): AchievementProgress {
  switch (achievement.id) {
    case "first-tile": {
      const target = 1;
      return {
        current: stats.totalTiles,
        target,
        fraction: clampFraction(stats.totalTiles, target),
        label: `${stats.totalTiles}/${target} tiles`,
      };
    }
    case "tiles-10": {
      const target = 10;
      return {
        current: stats.totalTiles,
        target,
        fraction: clampFraction(stats.totalTiles, target),
        label: `${stats.totalTiles}/${target} tiles`,
      };
    }
    case "tiles-100": {
      const target = 100;
      return {
        current: stats.totalTiles,
        target,
        fraction: clampFraction(stats.totalTiles, target),
        label: `${stats.totalTiles}/${target} tiles`,
      };
    }
    case "tiles-1000": {
      const target = 1000;
      return {
        current: stats.totalTiles,
        target,
        fraction: clampFraction(stats.totalTiles, target),
        label: `${stats.totalTiles.toLocaleString()}/${target.toLocaleString()} tiles`,
      };
    }
    case "tiles-10000": {
      const target = 10000;
      return {
        current: stats.totalTiles,
        target,
        fraction: clampFraction(stats.totalTiles, target),
        label: `${stats.totalTiles.toLocaleString()}/${target.toLocaleString()} tiles`,
      };
    }
    case "streak-3": {
      const target = 3;
      const current = Math.max(stats.currentStreak, stats.bestStreak);
      return {
        current,
        target,
        fraction: clampFraction(current, target),
        label: `${current}/${target} days`,
      };
    }
    case "streak-7": {
      const target = 7;
      const current = Math.max(stats.currentStreak, stats.bestStreak);
      return {
        current,
        target,
        fraction: clampFraction(current, target),
        label: `${current}/${target} days`,
      };
    }
    case "streak-30": {
      const target = 30;
      const current = Math.max(stats.currentStreak, stats.bestStreak);
      return {
        current,
        target,
        fraction: clampFraction(current, target),
        label: `${current}/${target} days`,
      };
    }
    case "day-1mi": {
      const target = MILE_M;
      const current = stats.maxDistanceInADayM;
      return {
        current,
        target,
        fraction: clampFraction(current, target),
        label: `${(current / MILE_M).toFixed(1)} mi / 1.0 mi`,
      };
    }
    case "day-5mi": {
      const target = 5 * MILE_M;
      const current = stats.maxDistanceInADayM;
      return {
        current,
        target,
        fraction: clampFraction(current, target),
        label: `${(current / MILE_M).toFixed(1)} mi / 5.0 mi`,
      };
    }
    case "day-100-tiles": {
      const target = 100;
      return {
        current: stats.maxTilesInADay,
        target,
        fraction: clampFraction(stats.maxTilesInADay, target),
        label: `${stats.maxTilesInADay}/${target} tiles`,
      };
    }
    case "distance-26": {
      const target = 26.2 * MILE_M;
      const current = stats.distanceM;
      return {
        current,
        target,
        fraction: clampFraction(current, target),
        label: `${(current / MILE_M).toFixed(1)} mi / 26.2 mi`,
      };
    }
    default: {
      return {
        current: 0,
        target: 1,
        fraction: 0,
        label: "Locked",
      };
    }
  }
}
