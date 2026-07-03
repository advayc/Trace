import { Image } from "expo-image";
import { Text, View } from "react-native";

import { colors, fonts, radius } from "@/constants/theme";
import { ACHIEVEMENTS } from "@/lib/achievements/definitions";

interface AchievementGridProps {
  unlockedIds: string[];
}

export function AchievementGrid({ unlockedIds }: AchievementGridProps) {
  const unlocked = new Set(unlockedIds);

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {ACHIEVEMENTS.map((achievement) => {
        const isUnlocked = unlocked.has(achievement.id);
        return (
          <View
            key={achievement.id}
            style={{
              width: "30.5%",
              flexGrow: 1,
              backgroundColor: isUnlocked ? colors.surfaceRaised : colors.surface,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: isUnlocked
                ? "rgba(232,160,76,0.35)"
                : colors.border,
              padding: 12,
              alignItems: "center",
              gap: 8,
              opacity: isUnlocked ? 1 : 0.55,
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
          </View>
        );
      })}
    </View>
  );
}
