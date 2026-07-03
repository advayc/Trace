import * as Notifications from "expo-notifications";

import type { ActiveSession } from "@/lib/activity/activity-types";
import { buildWalkActivityProps } from "@/lib/notifications/notification-format";
import {
  ensureNotificationPermission,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_IDS,
} from "@/lib/notifications/notification-service";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

function isEnabled(): boolean {
  if (process.env.EXPO_OS !== "android") return false;
  return settings.get(SETTINGS_KEYS.liveActivityEnabled, true);
}

let lastAndroidUpdateAt = 0;
const ANDROID_UPDATE_INTERVAL_MS = 5_000;

export const sessionNotificationService = {
  async onSessionStarted(session: ActiveSession): Promise<void> {
    if (!isEnabled()) return;
    if (!(await ensureNotificationPermission())) return;
    lastAndroidUpdateAt = 0;
    await this.onSessionUpdated(session, true);
  },

  async onSessionUpdated(
    session: ActiveSession,
    force = false,
  ): Promise<void> {
    if (!isEnabled()) return;
    if (!(await ensureNotificationPermission())) return;
    if (
      !force &&
      Date.now() - lastAndroidUpdateAt < ANDROID_UPDATE_INTERVAL_MS
    ) {
      return;
    }
    lastAndroidUpdateAt = Date.now();

    const props = buildWalkActivityProps(session, false);
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.sessionOngoing,
      content: {
        title: `${props.activityLabel} in progress`,
        body: `${props.tilesLabel} · ${props.timeLabel} · ${props.distanceLabel} · ${props.paceLabel}`,
        sticky: true,
        priority: Notifications.AndroidNotificationPriority.LOW,
        color: props.accentColor,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        channelId: NOTIFICATION_CHANNELS.session,
        seconds: 1,
      },
    });
  },

  async onSessionEnded(): Promise<void> {
    if (process.env.EXPO_OS !== "android") return;
    lastAndroidUpdateAt = 0;
    await Notifications.dismissNotificationAsync(NOTIFICATION_IDS.sessionOngoing);
    await Notifications.cancelScheduledNotificationAsync(
      NOTIFICATION_IDS.sessionOngoing,
    );
  },
};
