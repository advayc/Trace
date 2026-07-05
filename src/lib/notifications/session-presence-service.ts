import type { ActiveSession, Activity } from "@/lib/activity/activity-types";
import { liveActivityService } from "@/lib/notifications/live-activity-service";
import { notifySessionSummary } from "@/lib/notifications/session-summary-notifications";
import { sessionNotificationService } from "@/lib/notifications/session-notification-service";

export const sessionPresenceService = {
  async onSessionStarted(session: ActiveSession): Promise<void> {
    await Promise.all([
      liveActivityService.onSessionStarted(session),
      sessionNotificationService.onSessionStarted(session),
    ]);
  },

  async onSessionUpdated(session: ActiveSession): Promise<void> {
    await Promise.all([
      liveActivityService.onSessionUpdated(session),
      sessionNotificationService.onSessionUpdated(session),
    ]);
  },

  async onSessionEnded(activity: Activity): Promise<void> {
    await Promise.all([
      liveActivityService.onSessionEnded({
        id: activity.id,
        type: activity.type === "passive" ? "walk" : activity.type,
        startedAt: activity.startedAt,
        distanceM: activity.distanceM,
        durationMs: activity.durationMs,
        avgPaceSPerKm: activity.avgPaceSPerKm,
        activeCaloriesKcal: activity.activeCaloriesKcal,
        avgHeartRateBpm: activity.avgHeartRateBpm,
        newTiles: activity.newTiles,
        reclaimedTiles: activity.reclaimedTiles,
        route: activity.route,
      }),
      sessionNotificationService.onSessionEnded(),
      notifySessionSummary(activity),
    ]);
  },
};
