import { Image } from "expo-image";
import { Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { fonts, radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
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

const MEDAL_COLORS: Record<1 | 2 | 3, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

function RankBadge({ rank }: { rank: number }) {
  const { colors } = useTheme();
  const medalColor = MEDAL_COLORS[rank as 1 | 2 | 3];

  if (rank <= 3 && medalColor) {
    return (
      <View style={{ width: 28, alignItems: "center" }}>
        <Image
          source="sf:medal.fill"
          style={{ width: 22, height: 22 }}
          tintColor={medalColor}
        />
      </View>
    );
  }

  return (
    <Text
      style={{
        fontFamily: fonts.displayBold,
        fontSize: 18,
        color: colors.textFaint,
        width: 28,
        textAlign: "center",
      }}
    >
      {rank}
    </Text>
  );
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
  const { colors } = useTheme();

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
      <RankBadge rank={rank} />
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
