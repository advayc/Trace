import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";

import { LeaderboardRow } from "@/components/friends/leaderboard-row";
import { PillButton } from "@/components/ui/pill-button";
import { colors, fonts, radius } from "@/constants/theme";
import { DEMO_FRIENDS } from "@/constants/demo-friends";
import { useStats } from "@/hooks/use-stats";

export default function FriendsScreen() {
  const stats = useStats();

  const board = [
    ...DEMO_FRIENDS.map((f) => ({ ...f, isYou: false })),
    {
      id: "you",
      name: "You",
      initials: "YO",
      tiles: stats.totalTiles,
      streak: stats.currentStreak,
      hue: 33,
      isYou: true,
    },
  ].sort((a, b) => b.tiles - a.tiles);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, gap: 20, paddingTop: 72 }}
    >
      <View style={{ gap: 4 }}>
        <Text
          style={{
            fontFamily: fonts.displayBold,
            fontSize: 34,
            color: colors.text,
          }}
        >
          Friends
        </Text>
        <Text
          style={{ fontFamily: fonts.body, fontSize: 15, color: colors.textMuted }}
        >
          Who's really stomped more ground?
        </Text>
      </View>

      {/* Coming-soon CTA — auth lands in Phase 2 */}
      <View
        style={{
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: "rgba(232,160,76,0.3)",
          padding: 20,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            source="sf:sparkles"
            style={{ width: 20, height: 20 }}
            tintColor={colors.ember}
          />
          <Text
            style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.text }}
          >
            Real leaderboards are coming
          </Text>
        </View>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textMuted,
            lineHeight: 21,
          }}
        >
          Sign-in with Apple or Google, invite links, and neighborhood
          head-to-heads arrive in a future update. Below is a preview with
          sample explorers — your tile count is already real.
        </Text>
        <PillButton label="Sign in to compete — coming soon" onPress={() => {}} disabled />
      </View>

      <View style={{ gap: 10 }}>
        {board.map((row, i) => (
          <LeaderboardRow
            key={row.id}
            rank={i + 1}
            name={row.name}
            initials={row.initials}
            tiles={row.tiles}
            streak={row.streak}
            hue={row.hue}
            isYou={row.isYou}
          />
        ))}
      </View>

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.textFaint,
          textAlign: "center",
          paddingBottom: 12,
        }}
      >
        Friends will only ever see your tile counts — never your routes.
      </Text>
    </ScrollView>
  );
}
