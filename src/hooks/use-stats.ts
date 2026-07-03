import { useEffect, useState } from "react";

import { computeStats, type TraceStats } from "@/lib/stats/stats-service";
import { stompEngine } from "@/lib/stomp/stomp-engine";

/** Stats recomputed whenever the engine reports a change (throttled). */
export function useStats(): TraceStats {
  const [stats, setStats] = useState<TraceStats>(() => computeStats());

  useEffect(() => {
    let scheduled = false;
    const refresh = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        setStats(computeStats());
      }, 500);
    };
    const unsubscribe = stompEngine.on("stats:changed", refresh);
    refresh();
    return unsubscribe;
  }, []);

  return stats;
}
