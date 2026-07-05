import { Image } from "expo-image";
import { View } from "react-native";

import { radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { AchievementDef } from "@/lib/achievements/definitions";

interface AchievementBadgeIconProps {
  achievement: AchievementDef;
  unlocked: boolean;
  size?: number;
}

export function AchievementBadgeIcon({
  achievement,
  unlocked,
  size = 64,
}: AchievementBadgeIconProps) {
  const { colors } = useTheme();
  const iconSize = Math.round(size * 0.42);
  const coreSize = Math.round(size * 0.56);
  const accentSize = Math.round(size * 0.16);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.lg,
        backgroundColor: unlocked ? colors.emberDim : colors.fog,
        borderWidth: 1,
        borderColor: unlocked ? colors.accentBorder : colors.border,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: coreSize,
          height: coreSize,
          borderRadius: coreSize / 2,
          backgroundColor: unlocked ? colors.surfaceRaised : colors.surface,
          borderWidth: 1,
          borderColor: unlocked ? colors.emberLight : colors.borderStrong,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={`sf:${unlocked ? achievement.sf : "lock.fill"}`}
          style={{ width: iconSize, height: iconSize }}
          tintColor={unlocked ? colors.ember : colors.textFaint}
        />
      </View>

      <View
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: accentSize,
          height: accentSize,
          borderRadius: accentSize / 2,
          backgroundColor: unlocked ? colors.emberLight : colors.borderStrong,
          opacity: unlocked ? 1 : 0.6,
        }}
      />
    </View>
  );
}