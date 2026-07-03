import { create } from "zustand";

export interface SessionState {
  tracking: boolean;
  followUser: boolean;
  sessionNewTiles: number;
  lastFix: { latitude: number; longitude: number } | null;
  setTracking: (tracking: boolean) => void;
  setFollowUser: (follow: boolean) => void;
  incrementSessionTiles: () => void;
  setLastFix: (fix: { latitude: number; longitude: number }) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  tracking: false,
  followUser: true,
  sessionNewTiles: 0,
  lastFix: null,
  setTracking: (tracking) => set({ tracking }),
  setFollowUser: (followUser) => set({ followUser }),
  incrementSessionTiles: () =>
    set((s) => ({ sessionNewTiles: s.sessionNewTiles + 1 })),
  setLastFix: (lastFix) => set({ lastFix }),
}));
