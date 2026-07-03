import * as Notifications from "expo-notifications";
import { AppState } from "react-native";

import type { Activity } from "@/lib/activity/activity-types";
import { formatSessionSummaryBody } from "@/lib/notifications/notification-format";
import {
  ensureNotificationPermission,
  NOTIFICATION_CHANNELS,
} from "@/lib/notifications/notification-service";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

export async function notifySessionSummary(activity: Activity): Promise<void> {
  if (activity.type === "passive") return;
  if (!settings.get(SETTINGS_KEYS.sessionSummaryNotifications, true)) return;
  if (AppState.currentState === "active") return;
  if (!(await ensureNotificationPermission())) return;

  const summary = {
    type: activity.type as "walk" | "run",
    newTiles: activity.newTiles,
    distanceM: activity.distanceM,
    durationMs: activity.durationMs,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: activity.type === "run" ? "Run complete" : "Walk complete",
      body: formatSessionSummaryBody(summary),
      data: { type: "session-summary", id: activity.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      channelId: NOTIFICATION_CHANNELS.achievements,
      seconds: 1,
    },
  });
}
