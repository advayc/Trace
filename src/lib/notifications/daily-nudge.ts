import * as Notifications from "expo-notifications";

import {
  ensureNotificationPermission,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_IDS,
} from "@/lib/notifications/notification-service";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

const NUDGE_HOUR = 18;
const NUDGE_MINUTE = 0;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextNudgeDate(): Date | null {
  const now = new Date();
  const target = new Date(now);
  target.setHours(NUDGE_HOUR, NUDGE_MINUTE, 0, 0);
  if (now >= target) return null;
  return target;
}

export function recordAppOpenedToday(): void {
  settings.set(SETTINGS_KEYS.lastAppOpenDate, todayKey());
}

export async function cancelDailyNudge(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.dailyNudge);
}

export async function scheduleDailyNudgeIfNeeded(): Promise<void> {
  if (!settings.get(SETTINGS_KEYS.dailyNudgeNotifications, true)) return;
  if (!(await ensureNotificationPermission())) return;

  const lastOpen = settings.get<string | null>(SETTINGS_KEYS.lastAppOpenDate, null);
  if (lastOpen === todayKey()) {
    await cancelDailyNudge();
    return;
  }

  const target = nextNudgeDate();
  if (!target) return;

  await cancelDailyNudge();
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.dailyNudge,
    content: {
      title: "Your map is waiting",
      body: "Open Trace and take a walk — reveal new ground before the day ends.",
      data: { type: "daily-nudge" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
      channelId: NOTIFICATION_CHANNELS.reminders,
    },
  });
}

export async function onAppForeground(): Promise<void> {
  recordAppOpenedToday();
  await cancelDailyNudge();
}

export async function onAppBackground(): Promise<void> {
  await scheduleDailyNudgeIfNeeded();
}
