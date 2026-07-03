import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { AchievementGrid } from "@/components/stats/achievement-grid";
import { StatCard } from "@/components/stats/stat-card";
import { StreakRing } from "@/components/stats/streak-ring";
import { SectionHeader } from "@/components/ui/section-header";
import { colors, fonts } from "@/constants/theme";
import { useAchievementUnlocks } from "@/hooks/use-achievement-unlocks";
import { useSetting } from "@/hooks/use-settings";
import { useStats } from "@/hooks/use-stats";
import { ACHIEVEMENTS } from "@/lib/achievements/definitions";
import {
  formatArea,
  formatCompact,
  formatDistance,
  type Units,
} from "@/lib/stats/format";
import { SETTINGS_KEYS } from "@/lib/storage/settings";

export default function ProgressScreen() {
  const stats = useStats();
  const [units] = useSetting<Units>(SETTINGS_KEYS.units, "mi");
  const { unlockedIds } = useAchievementUnlocks();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, gap: 24, paddingTop: 72 }}
    >
      <View style={{ gap: 4 }}>
        <Animated.View entering={FadeInDown.duration(400)}>
        <Text
          style={{
            fontFamily: fonts.displayBold,
            fontSize: 34,
            color: colors.text,
          }}
        >
          Progress
        </Text>
        <Text
          style={{ fontFamily: fonts.body, fontSize: 15, color: colors.textMuted }}
        >
          {stats.todayNewTiles > 0
            ? `${formatCompact(stats.todayNewTiles)} new tiles today — keep going.`
            : "The blank spots are waiting."}
        </Text>
        </Animated.View>
      </View>

      <StreakRing
        current={stats.currentStreak}
        best={stats.bestStreak}
        todayActive={stats.todayNewTiles > 0}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <StatCard
          label="Tiles stomped"
          value={formatCompact(stats.totalTiles)}
          sf="hexagon.fill"
          index={0}
        />
        <StatCard
          label="Area revealed"
          value={formatArea(stats.areaKm2, units)}
          sf="square.dashed"
          index={1}
        />
        <StatCard
          label="Distance covered"
          value={formatDistance(stats.distanceM, units)}
          sf="figure.walk"
          index={2}
        />
        <StatCard
          label="Active days"
          value={formatCompact(stats.activeDays)}
          sf="calendar"
          accent
          index={3}
        />
      </View>

      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Achievements"
          subtitle={`${unlockedIds.length} of ${ACHIEVEMENTS.length} unlocked`}
        />
        <AchievementGrid unlockedIds={unlockedIds} />
      </View>
    </ScrollView>
  );
}
