import { Image } from "expo-image";
import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { fonts, radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ACHIEVEMENTS } from "@/lib/achievements/definitions";
import { staggerDelay } from "@/lib/motion/stagger";

interface AchievementGridProps {
  unlockedIds: string[];
}

export function AchievementGrid({ unlockedIds }: AchievementGridProps) {
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
        return (
          <Animated.View
            key={achievement.id}
            entering={FadeInUp.duration(360).delay(staggerDelay(index, 45))}
            style={{
              width: "30.5%",
              flexGrow: 1,
              backgroundColor: colors.surfaceRaised,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: isUnlocked ? colors.accentBorder : colors.border,
              padding: 14,
              alignItems: "center",
              gap: 10,
              opacity: isUnlocked ? 1 : 0.5,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isUnlocked ? colors.emberDim : colors.fog,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={`sf:${isUnlocked ? achievement.sf : "lock.fill"}`}
                style={{ width: 20, height: 20 }}
                tintColor={isUnlocked ? colors.ember : colors.textFaint}
              />
            </View>
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
          </Animated.View>
        );
      })}
    </View>
  );
}
