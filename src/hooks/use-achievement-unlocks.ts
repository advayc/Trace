import { useEffect, useState } from "react";
import { AppState } from "react-native";

import {
  evaluateAchievements,
  getUnlockedIds,
} from "@/lib/achievements/achievement-service";
import type { AchievementDef } from "@/lib/achievements/definitions";
import { notifyAchievementUnlocked } from "@/lib/notifications/achievement-notifications";
import { computeStats } from "@/lib/stats/stats-service";
import { stompEngine } from "@/lib/stomp/stomp-engine";

/**
 * Watches the engine, unlocks achievements as stats change, and surfaces the
 * most recent unlock for celebration UI (cleared via dismiss).
 */
export function useAchievementUnlocks() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>(getUnlockedIds);
  const [celebration, setCelebration] = useState<AchievementDef | null>(null);

  useEffect(() => {
    const unsubscribe = stompEngine.on("stats:changed", () => {
      const fresh = evaluateAchievements(computeStats());
      if (fresh.length > 0) {
        setUnlockedIds(getUnlockedIds());
        if (AppState.currentState === "active") {
          setCelebration(fresh[0]);
        } else {
          for (const achievement of fresh) {
            void notifyAchievementUnlocked(achievement);
          }
        }
      }
    });
    return unsubscribe;
  }, []);

  return {
    unlockedIds,
    celebration,
    dismissCelebration: () => setCelebration(null),
  };
}
