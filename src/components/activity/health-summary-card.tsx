import { Image } from "expo-image";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { PillButton } from "@/components/ui/pill-button";
import { fonts, radius } from "@/constants/theme";
import { useAppleHealth } from "@/hooks/use-apple-health";
import { useTheme } from "@/hooks/use-theme";
import { formatCompact } from "@/lib/stats/format";

export function HealthSummaryCard() {
  const { colors } = useTheme();
  const { available, enabled, busy, todaySteps, enable } = useAppleHealth();

  if (process.env.EXPO_OS !== "ios" || !available) return null;

  if (!enabled) {
    return (
      <Animated.View
        entering={FadeInDown.duration(360)}
        style={{
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
            <Image source="sf:heart.fill" style={{ width: 18, height: 18 }} tintColor={colors.ember} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.text }}>
              Connect Apple Health
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 18 }}>
              Sync workouts, calories, heart rate, and daily steps from your runs and walks.
            </Text>
          </View>
        </View>
        <PillButton
          label={busy ? "Connecting…" : "Connect Health"}
          onPress={() => {
            void enable();
          }}
          disabled={busy}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(360)}
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
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
        <Image source="sf:heart.fill" style={{ width: 18, height: 18 }} tintColor={colors.ember} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.text }}>
          Apple Health connected
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}>
          {todaySteps != null
            ? `${formatCompact(todaySteps)} steps today`
            : "Workouts sync after each session"}
        </Text>
      </View>
    </Animated.View>
  );
}
