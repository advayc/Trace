import { cellCenter, pointToCell } from "@/lib/h3";

import type { FriendTile } from "@/lib/friends/friends-service";

interface DemoFriendProfile {
  userId: string;
  displayName: string;
  username: string;
  targetTiles: number;
}

export const DEMO_FRIEND_PROFILES: DemoFriendProfile[] = [
  { userId: "demo-maya", displayName: "Maya Park", username: "demo_maya", targetTiles: 18 },
  {
    userId: "demo-jules",
    displayName: "Jules Rivera",
    username: "demo_jules",
    targetTiles: 14,
  },
  { userId: "demo-noah", displayName: "Noah Chen", username: "demo_noah", targetTiles: 16 },
];

function distanceScoreMeters(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const latScale = 111_320;
  const lngScale =
    111_320 * Math.cos(((from.latitude + to.latitude) / 2) * (Math.PI / 180));
  const dy = (to.latitude - from.latitude) * latScale;
  const dx = (to.longitude - from.longitude) * lngScale;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Deterministic, local-only tile ownership for App Store/demo capture.
 * Edit DEMO_FRIEND_PROFILES above to add/remove demo people.
 */
export function buildDemoFriendTiles(params: {
  viewportCells: string[];
  center: { latitude: number; longitude: number };
}): FriendTile[] {
  const { viewportCells, center } = params;
  if (viewportCells.length === 0 || DEMO_FRIEND_PROFILES.length === 0) return [];

  const centerCell = pointToCell(center.latitude, center.longitude);
  const byDistance = viewportCells
    .map((h3Index) => {
      const cell = cellCenter(h3Index);
      const distance = distanceScoreMeters(center, cell);
      const centerBias = h3Index === centerCell ? -500 : 0;
      return { h3Index, score: distance + centerBias };
    })
    .sort((a, b) => a.score - b.score)
    .map((row) => row.h3Index);

  const candidateCells = byDistance.slice(0, Math.min(240, byDistance.length));
  const taken = new Set<string>();
  const tiles: FriendTile[] = [];

  DEMO_FRIEND_PROFILES.forEach((profile, profileIndex) => {
    let picked = 0;
    for (
      let i = profileIndex;
      i < candidateCells.length && picked < profile.targetTiles;
      i += DEMO_FRIEND_PROFILES.length
    ) {
      const h3Index = candidateCells[i];
      if (taken.has(h3Index)) continue;
      taken.add(h3Index);
      tiles.push({
        h3Index,
        userId: profile.userId,
        visitCount: 1,
        displayName: profile.displayName,
        username: profile.username,
      });
      picked += 1;
    }
  });

  return tiles;
}
