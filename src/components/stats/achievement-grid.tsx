import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AchievementBadgeIcon } from "@/components/stats/achievement-badge-icon";
import { fonts, radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  ACHIEVEMENTS,
  getAchievementProgress,
  type AchievementDef,
} from "@/lib/achievements/definitions";
import type { TraceStats } from "@/lib/stats/stats-service";
import { staggerDelay } from "@/lib/motion/stagger";

interface AchievementGridProps {
  unlockedIds: string[];
  stats: TraceStats;
  onSelect: (achievement: AchievementDef) => void;
}

export function AchievementGrid({ unlockedIds, stats, onSelect }: AchievementGridProps) {
  const { colors } = useTheme();
  const unlocked = new Set(unlockedIds);

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {ACHIEVEMENTS.map((achievement, index) => {
        const isUnlocked = unlocked.has(achievement.id);
        const progress = getAchievementProgress(achievement, stats);
        return (
          <Animated.View
            key={achievement.id}
            entering={FadeInUp.duration(360).delay(staggerDelay(index, 45))}
            style={{
              width: "30.5%",
              flexGrow: 1,
            }}
          >
            <Pressable
              onPress={() => onSelect(achievement)}
              style={{
                backgroundColor: colors.surfaceRaised,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: isUnlocked ? colors.accentBorder : colors.border,
                padding: 14,
                alignItems: "center",
                gap: 10,
                opacity: isUnlocked ? 1 : 0.78,
              }}
              accessibilityRole="button"
              accessibilityLabel={`${achievement.title}. ${isUnlocked ? "Unlocked" : "Locked"}. ${progress.label}`}
            >
              <AchievementBadgeIcon
                achievement={achievement}
                unlocked={isUnlocked}
                size={68}
              />
              <Text
                numberOfLines={2}
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 12,
                  color: isUnlocked ? colors.text : colors.textMuted,
                  textAlign: "center",
                }}
              >
                {achievement.title}
              </Text>
              <View style={{ width: "100%", gap: 6 }}>
                <View
                  style={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: colors.fog,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${Math.max(0, Math.min(100, progress.fraction * 100))}%`,
                      height: "100%",
                      borderRadius: 999,
                      backgroundColor: isUnlocked ? colors.mint : colors.ember,
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 11,
                    color: colors.textFaint,
                    textAlign: "center",
                  }}
                >
                  {isUnlocked ? "Unlocked" : progress.label}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
