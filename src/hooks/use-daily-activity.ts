import { useEffect, useMemo, useState } from "react";

import { tileRepository, type DailyStat } from "@/lib/storage/tile-db";
import { stompEngine } from "@/lib/stomp/stomp-engine";

export function useDailyActivity(days = 84): DailyStat[] {
  const [activity, setActivity] = useState<DailyStat[]>(() =>
    tileRepository.recentDailyStats(days),
  );

  useEffect(() => {
    let scheduled = false;
    const refresh = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        setActivity(tileRepository.recentDailyStats(days));
      }, 500);
    };
    const unsubscribe = stompEngine.on("stats:changed", refresh);
    refresh();
    return unsubscribe;
  }, [days]);

  return activity;
}

export function useTileVisitSamples(limit = 96): { visitCount: number }[] {
  const [samples, setSamples] = useState<{ visitCount: number }[]>(() =>
    tileRepository.recentTileVisits(limit),
  );

  useEffect(() => {
    let scheduled = false;
    const refresh = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        setSamples(tileRepository.recentTileVisits(limit));
      }, 500);
    };
    const unsubscribe = stompEngine.on("stats:changed", refresh);
    refresh();
    return unsubscribe;
  }, [limit]);

  return samples;
}
