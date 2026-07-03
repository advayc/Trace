import { useEffect, useState } from "react";

import { activityRepository } from "@/lib/activity/activity-repository";
import type { Activity } from "@/lib/activity/activity-types";
import { activityRecorder } from "@/lib/activity/activity-recorder";

export function useActivityHistory(limit = 10): Activity[] {
  const [history, setHistory] = useState<Activity[]>(() =>
    activityRepository.recent(limit),
  );

  useEffect(() => {
    const refresh = () => setHistory(activityRepository.recent(limit));
    const offEnded = activityRecorder.on("session:ended", refresh);
    refresh();
    return offEnded;
  }, [limit]);

  return history;
}
