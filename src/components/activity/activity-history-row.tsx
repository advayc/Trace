import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { colors, fonts, radius } from "@/constants/theme";
import type { Activity } from "@/lib/activity/activity-types";
import { formatDistanceKm, formatDuration, formatPace } from "@/lib/activity/activity-format";
import { staggerDelay } from "@/lib/motion/stagger";
import { formatCompact } from "@/lib/stats/format";

interface ActivityHistoryRowProps {
  activity: Activity;
  index?: number;
  onShare?: (activity: Activity) => void;
}

export function ActivityHistoryRow({
  activity,
  index = 0,
  onShare,
}: ActivityHistoryRowProps) {
  const label = activity.type === "run" ? "Run" : "Walk";
  const date = new Date(activity.endedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <Animated.View
      entering={FadeInRight.duration(360).delay(staggerDelay(index, 50))}
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.emberDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={activity.type === "run" ? "sf:figure.run" : "sf:figure.walk"}
            style={{ width: 16, height: 16 }}
            tintColor={colors.ember}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 16, color: colors.text }}>
            {label} · {date}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}>
            {formatDistanceKm(activity.distanceM)} · {formatDuration(activity.durationMs)} ·{" "}
            {formatPace(activity.avgPaceSPerKm)}
          </Text>
        </View>
        <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.mint }}>
          +{formatCompact(activity.newTiles)}
        </Text>
      </View>
      {onShare ? (
        <Pressable
          onPress={() => onShare(activity)}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.ember }}>
            Share card
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
