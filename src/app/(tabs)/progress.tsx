import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ActivityHeatmap } from "@/components/stats/activity-heatmap";
import { AchievementGrid } from "@/components/stats/achievement-grid";
import { StatCard } from "@/components/stats/stat-card";
import { StreakRing } from "@/components/stats/streak-ring";
import { TileIntensityGrid } from "@/components/stats/tile-intensity-grid";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SectionHeader } from "@/components/ui/section-header";
import { colors, spacing } from "@/constants/theme";
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
import { staggerDelay } from "@/lib/motion/stagger";
import { SETTINGS_KEYS } from "@/lib/storage/settings";

export default function ProgressScreen() {
  const stats = useStats();
  const [units] = useSetting<Units>(SETTINGS_KEYS.units, "mi");
  const { unlockedIds } = useAchievementUnlocks();

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
        title="Progress"
        subtitle={
          stats.todayNewTiles > 0
            ? `${formatCompact(stats.todayNewTiles)} new tiles today — keep going.`
            : "The blank spots are waiting."
        }
      />

      <StreakRing
        current={stats.currentStreak}
        best={stats.bestStreak}
        todayActive={stats.todayNewTiles > 0}
      />

      <ActivityHeatmap />

      <TileIntensityGrid />

      <Animated.View
        entering={FadeInDown.duration(380).delay(staggerDelay(1, 60))}
        style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
      >
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
      </Animated.View>

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
