import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { AccountRow } from "@/components/auth/account-row";
import { PillButton } from "@/components/ui/pill-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SectionHeader } from "@/components/ui/section-header";
import { fonts, radius, spacing } from "@/constants/theme";
import { staggerDelay } from "@/lib/motion/stagger";
import { useSetting } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { resetAchievements } from "@/lib/achievements/achievement-service";
import {
  isBackgroundTrackingActive,
  startBackgroundTracking,
  stopBackgroundTracking,
} from "@/lib/location/background-task";
import type { Units } from "@/lib/stats/format";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";
import { tileRepository } from "@/lib/storage/tile-db";
import { stompEngine } from "@/lib/stomp/stomp-engine";

function SettingRow({
  sf,
  title,
  subtitle,
  control,
  index = 0,
}: {
  sf: string;
  title: string;
  subtitle: string;
  control: React.ReactNode;
  index?: number;
}) {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(360).delay(staggerDelay(index, 70))}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: colors.surfaceRaised,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 18,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.emberDim,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={`sf:${sf}`}
          style={{ width: 18, height: 18 }}
          tintColor={colors.ember}
        />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.text }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.textMuted,
            lineHeight: 18,
          }}
        >
          {subtitle}
        </Text>
      </View>
      {control}
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const { colors, scheme, setColorScheme } = useTheme();
  const [units, setUnits] = useSetting<Units>(SETTINGS_KEYS.units, "km");
  const [bgEnabled, setBgEnabled] = useSetting(
    SETTINGS_KEYS.backgroundTracking,
    false,
  );
  const [bgBusy, setBgBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const active = await isBackgroundTrackingActive();
      if (active !== bgEnabled) setBgEnabled(active);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleBackground = async (next: boolean) => {
    setBgBusy(true);
    try {
      if (next) {
        const result = await startBackgroundTracking();
        if (result === "started") {
          setBgEnabled(true);
        } else {
          setBgEnabled(false);
          Alert.alert(
            "Permission needed",
            result === "denied-background"
              ? 'Background tracking needs the "Always" location permission. You can grant it in Settings.'
              : "Trace needs location access to reveal tiles.",
          );
        }
      } else {
        await stopBackgroundTracking();
        setBgEnabled(false);
      }
    } finally {
      setBgBusy(false);
    }
  };

  const confirmClear = () => {
    Alert.alert(
      "Clear all data?",
      "This permanently deletes every revealed tile, your stats, streaks, and achievements on this device. There is no undo.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete everything",
          style: "destructive",
          onPress: () => {
            tileRepository.clearAll();
            resetAchievements();
            stompEngine.resetSession();
            settings.remove(SETTINGS_KEYS.unlockedAchievements);
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: spacing.screen,
        gap: spacing.section,
        paddingTop: 72,
        paddingBottom: 32,
      }}
    >
      <ScreenHeader title="You" subtitle="Your map, your rules." />

      <Animated.View
        entering={FadeInDown.duration(360).delay(staggerDelay(0, 70))}
        style={{ gap: 12 }}
      >
        <SectionHeader title="Account" />
        <AccountRow />
      </Animated.View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Appearance" />
        <SettingRow
          sf="sun.max.fill"
          title="Light mode"
          subtitle={scheme === "light" ? "Paper map and light chrome" : "Dark map and charcoal chrome"}
          index={0}
          control={
            <Switch
              value={scheme === "light"}
              onValueChange={(v) => setColorScheme(v ? "light" : "dark")}
              trackColor={{ true: colors.ember }}
            />
          }
        />
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Tracking" />
        <SettingRow
          sf="location.fill.viewfinder"
          title="Background tracking"
          subtitle='Keep revealing tiles with the screen locked. Requires "Always" location. Off by default.'
          index={1}
          control={
            <Switch
              value={bgEnabled}
              disabled={bgBusy}
              onValueChange={toggleBackground}
              trackColor={{ true: colors.ember }}
            />
          }
        />
        <SettingRow
          sf="ruler"
          title="Units"
          subtitle={units === "mi" ? "Miles and square miles" : "Kilometers and square kilometers"}
          index={2}
          control={
            <Switch
              value={units === "km"}
              onValueChange={(v) => setUnits(v ? "km" : "mi")}
              trackColor={{ true: colors.ember }}
            />
          }
        />
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Privacy" />
        <Animated.View
          entering={FadeInDown.duration(360).delay(staggerDelay(3, 70))}
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.successBorder,
            padding: 18,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image
              source="sf:lock.shield.fill"
              style={{ width: 18, height: 18 }}
              tintColor={colors.mint}
            />
            <Text
              style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.text }}
            >
              Everything stays on this device
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textMuted,
              lineHeight: 19,
            }}
          >
            Tiles are stored locally as coarse hexagon IDs. Signing in is
            optional — even then, only hexagon IDs ever sync, never your
            precise location.
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.duration(360).delay(staggerDelay(4, 70))}
        style={{ gap: 12 }}
      >
        <SectionHeader title="Danger zone" />
        <PillButton label="Clear all data" variant="danger" onPress={confirmClear} />
      </Animated.View>

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.textFaint,
          textAlign: "center",
        }}
      >
        Trace v1.0 — walk to unlock your city.
      </Text>
    </ScrollView>
  );
}
