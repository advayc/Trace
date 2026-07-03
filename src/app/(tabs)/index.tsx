import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { FogMap } from "@/components/map/fog-map";
import { LocationDenied } from "@/components/map/location-denied";
import { ConfettiCelebration } from "@/components/ui/confetti-celebration";
import { colors } from "@/constants/theme";
import { useAchievementUnlocks } from "@/hooks/use-achievement-unlocks";
import { useSetting } from "@/hooks/use-settings";
import { locationService } from "@/lib/location/location-service";
import { SETTINGS_KEYS } from "@/lib/storage/settings";
import { useSessionStore } from "@/store/session-store";

export default function MapScreen() {
  const [onboarded] = useSetting(SETTINGS_KEYS.onboarded, false);
  const [permission, setPermission] = useState<"unknown" | "granted" | "denied">(
    "unknown",
  );
  const setTracking = useSessionStore((s) => s.setTracking);
  const { celebration, dismissCelebration } = useAchievementUnlocks();

  useEffect(() => {
    if (!onboarded) return;
    let cancelled = false;
    (async () => {
      const granted =
        (await locationService.hasForegroundPermission()) ||
        (await locationService.requestForegroundPermission());
      if (cancelled) return;
      setPermission(granted ? "granted" : "denied");
      if (granted) {
        await locationService.startForegroundWatch("passive");
        setTracking(true);
      }
    })();
    return () => {
      cancelled = true;
      locationService.stopForegroundWatch();
      setTracking(false);
    };
  }, [onboarded, setTracking]);

  if (!onboarded) return <Redirect href="/onboarding" />;

  if (permission === "denied") return <LocationDenied />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {permission === "granted" ? <FogMap /> : null}
      <ConfettiCelebration
        achievement={celebration}
        onDismiss={dismissCelebration}
      />
    </View>
  );
}
