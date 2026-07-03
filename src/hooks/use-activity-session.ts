import { useEffect, useState } from "react";

import { activityRecorder } from "@/lib/activity/activity-recorder";
import type { Activity, ActiveSession } from "@/lib/activity/activity-types";

export function useActivitySession(): {
  activeSession: ActiveSession | null;
  latestActivity: Activity | null;
} {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() =>
    activityRecorder.getActiveSession(),
  );
  const [latestActivity, setLatestActivity] = useState<Activity | null>(() =>
    activityRecorder.latestActivity(),
  );

  useEffect(() => {
    const offUpdate = activityRecorder.on("session:updated", (session) => {
      setActiveSession(session);
    });
    const offEnded = activityRecorder.on("session:ended", (activity) => {
      setLatestActivity(activity);
    });
    const interval = setInterval(() => {
      const session = activityRecorder.getActiveSession();
      if (session) setActiveSession(session);
    }, 1000);
    return () => {
      offUpdate();
      offEnded();
      clearInterval(interval);
    };
  }, []);

  return { activeSession, latestActivity };
}
