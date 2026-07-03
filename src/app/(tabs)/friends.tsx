import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { LeaderboardRow } from "@/components/friends/leaderboard-row";
import { PillButton } from "@/components/ui/pill-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { colors, fonts, radius, spacing } from "@/constants/theme";
import { DEMO_FRIENDS } from "@/constants/demo-friends";
import { useStats } from "@/hooks/use-stats";

export default function FriendsScreen() {
  const router = useRouter();
  const stats = useStats();

  const board = [
    ...DEMO_FRIENDS.map((f) => ({ ...f, isYou: false })),
    {
      id: "you",
      name: "You",
      initials: "YO",
      tiles: stats.totalTiles,
      streak: stats.currentStreak,
      hue: 220,
      isYou: true,
    },
  ].sort((a, b) => b.tiles - a.tiles);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: spacing.screen,
        gap: spacing.section,
        paddingTop: 72,
        paddingBottom: 32,
      }}
    >
      <ScreenHeader
        title="Friends"
        subtitle="Compare coverage with people you walk with."
      />

      <Animated.View
        entering={FadeInDown.duration(400).delay(80)}
        style={{
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.accentBorder,
          padding: 22,
          gap: 14,
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
              source="sf:person.2.fill"
              style={{ width: 18, height: 18 }}
              tintColor={colors.ember}
            />
          </View>
          <Text
            style={{ fontFamily: fonts.semibold, fontSize: 17, color: colors.text }}
          >
            Sign in to unlock leaderboards
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
          Connect with Apple, Google, or email to sync tiles and compete.
          Below is a preview — your tile count is already real.
        </Text>
        <PillButton
          label="Sign in or create account"
          onPress={() => router.push("/sign-in")}
        />
      </Animated.View>

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
            index={i}
          />
        ))}
      </View>

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.textFaint,
          textAlign: "center",
        }}
      >
        Friends only see tile counts — never your routes.
      </Text>
    </ScrollView>
  );
}
