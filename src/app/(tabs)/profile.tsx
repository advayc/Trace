import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";

import { PillButton } from "@/components/ui/pill-button";
import { SectionHeader } from "@/components/ui/section-header";
import { colors, fonts, radius } from "@/constants/theme";
import { useSetting } from "@/hooks/use-settings";
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
}: {
  sf: string;
  title: string;
  subtitle: string;
  control: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
      }}
    >
      <Image
        source={`sf:${sf}`}
        style={{ width: 22, height: 22 }}
        tintColor={colors.ember}
      />
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={{ fontFamily: fonts.medium, fontSize: 16, color: colors.text }}
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
    </View>
  );
}

export default function ProfileScreen() {
  const [units, setUnits] = useSetting<Units>(SETTINGS_KEYS.units, "mi");
  const [bgEnabled, setBgEnabled] = useSetting(
    SETTINGS_KEYS.backgroundTracking,
    false,
  );
  const [bgBusy, setBgBusy] = useState(false);

  // Reconcile the persisted toggle with the OS task state on mount.
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
      contentContainerStyle={{ padding: 20, gap: 24, paddingTop: 72 }}
    >
      <View style={{ gap: 4 }}>
        <Text
          style={{
            fontFamily: fonts.displayBold,
            fontSize: 34,
            color: colors.text,
          }}
        >
          You
        </Text>
        <Text
          style={{ fontFamily: fonts.body, fontSize: 15, color: colors.textMuted }}
        >
          Your map, your rules.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Tracking" />
        <SettingRow
          sf="location.fill.viewfinder"
          title="Background tracking"
          subtitle='Keep revealing tiles with the screen locked or another app open. Requires "Always" location. Off by default.'
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
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Image
              source="sf:lock.shield.fill"
              style={{ width: 18, height: 18 }}
              tintColor={colors.mint}
            />
            <Text
              style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.text }}
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
            Tiles are stored locally as coarse hexagon IDs. Trace has no
            account, no server, and sends nothing anywhere in this version.
          </Text>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Danger zone" />
        <PillButton label="Clear all data" variant="danger" onPress={confirmClear} />
      </View>

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.textFaint,
          textAlign: "center",
          paddingBottom: 12,
        }}
      >
        Trace v1.0 — walk to unlock your city.
      </Text>
    </ScrollView>
  );
}
