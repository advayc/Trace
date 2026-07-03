import * as Notifications from "expo-notifications";

import type { AchievementDef } from "@/lib/achievements/definitions";
import {
  ensureNotificationPermission,
  NOTIFICATION_CHANNELS,
} from "@/lib/notifications/notification-service";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

export async function notifyAchievementUnlocked(
  achievement: AchievementDef,
): Promise<void> {
  if (!settings.get(SETTINGS_KEYS.achievementNotifications, true)) return;
  if (!(await ensureNotificationPermission())) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Milestone unlocked",
      body: achievement.title,
      data: { type: "achievement", id: achievement.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      channelId: NOTIFICATION_CHANNELS.achievements,
      seconds: 1,
    },
  });
}
