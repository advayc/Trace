export interface DemoFriend {
  id: string;
  name: string;
  initials: string;
  tiles: number;
  streak: number;
  /** deterministic accent hue for the avatar */
  hue: number;
}

/**
 * Demo-only leaderboard data. Real friends arrive in Phase 2 with auth —
 * these rows make the tab feel real without faking a working backend.
 */
export const DEMO_FRIENDS: DemoFriend[] = [
  { id: "f1", name: "grace", initials: "GR", tiles: 21480, streak: 24, hue: 158 },
  { id: "f2", name: "Heather", initials: "HE", tiles: 17922, streak: 11, hue: 36 },
  { id: "f3", name: "rain", initials: "RA", tiles: 14310, streak: 47, hue: 210 },
  { id: "f4", name: "Miles", initials: "MI", tiles: 9863, streak: 3, hue: 12 },
  { id: "f5", name: "Ana P.", initials: "AP", tiles: 6244, streak: 8, hue: 268 },
];
