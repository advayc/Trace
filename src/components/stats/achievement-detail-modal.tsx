import { Modal, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { AchievementBadgeIcon } from "@/components/stats/achievement-badge-icon";
import { fonts, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  getAchievementProgress,
  type AchievementDef,
} from "@/lib/achievements/definitions";
import type { TraceStats } from "@/lib/stats/stats-service";

interface AchievementDetailModalProps {
  achievement: AchievementDef | null;
  stats: TraceStats;
  unlocked: boolean;
  onDismiss: () => void;
}

export function AchievementDetailModal({
  achievement,
  stats,
  unlocked,
  onDismiss,
}: AchievementDetailModalProps) {
  const { colors } = useTheme();

  if (!achievement) return null;

  const progress = getAchievementProgress(achievement, stats);
  const progressPercent = Math.max(0, Math.min(100, progress.fraction * 100));

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onDismiss}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Pressable
          onPress={onDismiss}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: colors.overlay,
          }}
        />

        <Animated.View
          entering={FadeInDown.duration(260)}
          style={{
            marginHorizontal: spacing.screen,
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: colors.accentBorder,
            padding: 22,
            gap: 18,
          }}
        >
          <Animated.View entering={FadeIn.duration(180)} style={{ alignItems: "center", gap: 14 }}>
            <AchievementBadgeIcon achievement={achievement} unlocked={unlocked} size={96} />
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text
                style={{
                  fontFamily: fonts.semibold,
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: unlocked ? colors.mint : colors.ember,
                }}
              >
                {unlocked ? "Unlocked" : "Achievement"}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.displayBold,
                  fontSize: 26,
                  color: colors.text,
                  textAlign: "center",
                }}
              >
                {achievement.title}
              </Text>
            </View>
          </Animated.View>

          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontFamily: fonts.semibold,
                fontSize: 12,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: colors.textFaint,
              }}
            >
              How to achieve
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 15,
                lineHeight: 22,
                color: colors.textMuted,
              }}
            >
              {achievement.description}
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontFamily: fonts.semibold,
                fontSize: 12,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: colors.textFaint,
              }}
            >
              Progress
            </Text>
            <View
              style={{
                height: 12,
                borderRadius: 999,
                backgroundColor: colors.fog,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: unlocked ? colors.mint : colors.ember,
                }}
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 13,
                  color: colors.textMuted,
                }}
              >
                {progress.label}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 13,
                  color: unlocked ? colors.mint : colors.emberLight,
                }}
              >
                {Math.round(progressPercent)}%
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => ({
              marginTop: 6,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              backgroundColor: colors.surface,
              paddingVertical: 14,
              alignItems: "center",
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: fonts.semibold,
                fontSize: 15,
                color: colors.text,
              }}
            >
              Close
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}