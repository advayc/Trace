import type { LiveActivity } from "expo-widgets";

import type { ActiveSession } from "@/lib/activity/activity-types";
import {
  buildWalkActivityProps,
} from "@/lib/notifications/notification-format";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";
import TraceWalkActivity, {
  type TraceWalkActivityProps,
} from "@/widgets/trace-walk-activity";

const STALE_MS = 90_000;

let instance: LiveActivity<TraceWalkActivityProps> | null = null;
let lastMovementAt = 0;
let lastDistanceM = 0;
let lastNewTiles = 0;

function isLiveActivityEnabled(): boolean {
  if (process.env.EXPO_OS !== "ios") return false;
  return settings.get(SETTINGS_KEYS.liveActivityEnabled, true);
}

function sessionProps(session: ActiveSession) {
  if (
    session.distanceM > lastDistanceM ||
    session.newTiles > lastNewTiles
  ) {
    lastMovementAt = Date.now();
    lastDistanceM = session.distanceM;
    lastNewTiles = session.newTiles;
  }
  const isStale = Date.now() - lastMovementAt > STALE_MS;
  return buildWalkActivityProps(session, isStale);
}

export const liveActivityService = {
  async onSessionStarted(session: ActiveSession): Promise<void> {
    if (!isLiveActivityEnabled()) return;
    lastMovementAt = Date.now();
    lastDistanceM = session.distanceM;
    lastNewTiles = session.newTiles;
    try {
      instance = TraceWalkActivity.start(sessionProps(session), "trace://map");
    } catch {
      instance = null;
    }
  },

  async onSessionUpdated(session: ActiveSession): Promise<void> {
    if (!isLiveActivityEnabled() || !instance) return;
    try {
      await instance.update(sessionProps(session));
    } catch {
      instance = null;
    }
  },

  async onSessionEnded(session: ActiveSession): Promise<void> {
    if (!instance) return;
    const props = buildWalkActivityProps(session, false);
    try {
      await instance.end("default", props, new Date());
    } catch {
      // Best-effort dismissal.
    } finally {
      instance = null;
      lastMovementAt = 0;
      lastDistanceM = 0;
      lastNewTiles = 0;
    }
  },
};
