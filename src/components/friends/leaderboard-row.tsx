import { Image } from "expo-image";
import { Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { colors, fonts, radius } from "@/constants/theme";
import { formatCompact } from "@/lib/stats/format";
import { staggerDelay } from "@/lib/motion/stagger";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  initials: string;
  tiles: number;
  streak?: number;
  hue: number;
  isYou?: boolean;
  index?: number;
}

export function LeaderboardRow({
  rank,
  name,
  initials,
  tiles,
  streak,
  hue,
  isYou,
  index = 0,
}: LeaderboardRowProps) {
  return (
    <Animated.View
      entering={FadeInRight.duration(360).delay(staggerDelay(index, 55))}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: colors.surfaceRaised,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: isYou ? colors.accentBorder : colors.border,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.displayBold,
          fontSize: 18,
          color: rank <= 3 ? colors.ember : colors.textFaint,
          width: 28,
          textAlign: "center",
        }}
      >
        {rank}
      </Text>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: `hsl(${hue}, 50%, 18%)`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: 14,
            color: `hsl(${hue}, 70%, 75%)`,
          }}
        >
          {initials}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{ fontFamily: fonts.semibold, fontSize: 16, color: colors.text }}
        >
          {name}
          {isYou ? "  · you" : ""}
        </Text>
        {typeof streak === "number" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Image
              source="sf:flame.fill"
              style={{ width: 11, height: 11 }}
              tintColor={colors.mint}
            />
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.textMuted,
              }}
            >
              {streak} day streak
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            connected
          </Text>
        )}
      </View>
      <View style={{ alignItems: "flex-end", gap: 2 }}>
        <Text
          style={{
            fontFamily: fonts.displayBold,
            fontSize: 18,
            color: colors.text,
          }}
        >
          {formatCompact(tiles)}
        </Text>
        <Text
          style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textFaint }}
        >
          tiles
        </Text>
      </View>
    </Animated.View>
  );
}
