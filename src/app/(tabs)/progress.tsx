import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { AchievementDetailModal } from "@/components/stats/achievement-detail-modal";
import { AchievementGrid } from "@/components/stats/achievement-grid";
import { StatCard } from "@/components/stats/stat-card";
import { StreakRing } from "@/components/stats/streak-ring";
import { TileIntensityGrid } from "@/components/stats/tile-intensity-grid";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SectionHeader } from "@/components/ui/section-header";
import { spacing } from "@/constants/theme";
import { useSetting } from "@/hooks/use-settings";
import { useStats } from "@/hooks/use-stats";
import { useTheme } from "@/hooks/use-theme";
import { useUnlockedAchievementIds } from "@/hooks/use-unlocked-achievement-ids";
import { ACHIEVEMENTS } from "@/lib/achievements/definitions";
import { staggerDelay } from "@/lib/motion/stagger";
import {
    formatArea,
    formatCompact,
    formatDistance,
    type Units,
} from "@/lib/stats/format";
import { SETTINGS_KEYS } from "@/lib/storage/settings";

export default function ProgressScreen() {
  const { colors } = useTheme();
  const stats = useStats();
  const [units] = useSetting<Units>(SETTINGS_KEYS.units, "km");
  const unlockedIds = useUnlockedAchievementIds();
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const selectedAchievement = ACHIEVEMENTS.find((achievement) => achievement.id === selectedAchievementId) ?? null;
  const selectedUnlocked = selectedAchievement ? unlockedIds.includes(selectedAchievement.id) : false;
  const refreshScreen = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 520);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: colors.bg }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshScreen}
            tintColor={colors.ember}
          />
        }
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
          <AchievementGrid
            unlockedIds={unlockedIds}
            stats={stats}
            onSelect={(achievement) => setSelectedAchievementId(achievement.id)}
          />
        </View>
      </ScrollView>

      <AchievementDetailModal
        achievement={selectedAchievement}
        stats={stats}
        unlocked={selectedUnlocked}
        onDismiss={() => setSelectedAchievementId(null)}
      />
    </View>
  );
}
