import { Image } from "expo-image";
import { Text, View } from "react-native";

import { colors, fonts, radius } from "@/constants/theme";
import { formatCompact } from "@/lib/stats/format";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  initials: string;
  tiles: number;
  streak: number;
  hue: number;
  isYou?: boolean;
}

export function LeaderboardRow({
  rank,
  name,
  initials,
  tiles,
  streak,
  hue,
  isYou,
}: LeaderboardRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: isYou ? colors.surfaceRaised : colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: isYou ? "rgba(232,160,76,0.35)" : colors.border,
        padding: 14,
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
          backgroundColor: `hsl(${hue}, 45%, 22%)`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: 14,
            color: `hsl(${hue}, 70%, 72%)`,
          }}
        >
          {initials}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{ fontFamily: fonts.medium, fontSize: 16, color: colors.text }}
        >
          {name}
          {isYou ? "  (you)" : ""}
        </Text>
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
    </View>
  );
}
