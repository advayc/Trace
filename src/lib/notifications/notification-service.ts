import * as Notifications from "expo-notifications";

export const NOTIFICATION_CHANNELS = {
  session: "trace-session",
  achievements: "trace-achievements",
  reminders: "trace-reminders",
} as const;

export const NOTIFICATION_IDS = {
  sessionOngoing: "trace-session-ongoing",
  dailyNudge: "trace-daily-nudge",
} as const;

let initialized = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function initNotificationService(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (process.env.EXPO_OS === "android") {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.session, {
      name: "Active walk or run",
      importance: Notifications.AndroidImportance.LOW,
      sound: null,
      vibrationPattern: null,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.achievements, {
      name: "Achievements",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.reminders, {
      name: "Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  await initNotificationService();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const next = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return next.granted;
}

export async function hasNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  return current.granted;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  await initNotificationService();
  return hasNotificationPermission();
}
