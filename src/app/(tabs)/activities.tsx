import { ScrollView, View } from "react-native";

import { ActivityHistoryRow } from "@/components/activity/activity-history-row";
import { HealthSummaryCard } from "@/components/activity/health-summary-card";
import { LiveStatsBar } from "@/components/activity/live-stats-bar";
import { SessionControls } from "@/components/activity/session-controls";
import { ActivityHeatmap } from "@/components/stats/activity-heatmap";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SectionHeader } from "@/components/ui/section-header";
import { spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useActivityHistory } from "@/hooks/use-activity-history";
import { useActivitySession } from "@/hooks/use-activity-session";
import { useActivityShareCard } from "@/hooks/use-activity-share-card";
import { useSetting } from "@/hooks/use-settings";
import { useStats } from "@/hooks/use-stats";
import { formatCompact, formatDistance, type Units } from "@/lib/stats/format";
import { activityRecorder } from "@/lib/activity/activity-recorder";
import { SETTINGS_KEYS } from "@/lib/storage/settings";

export default function ActivitiesScreen() {
  const { colors } = useTheme();
  const stats = useStats();
  const activityHistory = useActivityHistory(30);
  const { activeSession, latestActivity } = useActivitySession();
  const [units] = useSetting<Units>(SETTINGS_KEYS.units, "km");
  const { share, hiddenCard } = useActivityShareCard();

  const startWalk = () => {
    activityRecorder.start("walk");
  };

  const startRun = () => {
    activityRecorder.start("run");
  };

  const stopSession = () => {
    activityRecorder.stop();
  };

  const shareLatest = () => {
    if (!latestActivity) return;
    share(latestActivity);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
          title="Activities"
          subtitle={
            stats.todayNewTiles > 0
              ? `${formatCompact(stats.todayNewTiles)} new tiles today · ${formatDistance(stats.distanceM, units)} total`
              : "Your walks, runs, and daily rhythm."
          }
        />

        <HealthSummaryCard />

        {activeSession ? <LiveStatsBar session={activeSession} /> : null}

        <SessionControls
          activeSession={activeSession}
          latestActivity={latestActivity}
          onStartWalk={startWalk}
          onStartRun={startRun}
          onStop={stopSession}
          onShareLatest={shareLatest}
        />

        <ActivityHeatmap compact />

        {activityHistory.length > 0 ? (
          <View style={{ gap: 10 }}>
            <SectionHeader title="Workouts" subtitle="Walks and runs recorded on Trace" />
            {activityHistory.map((activity, i) => (
              <ActivityHistoryRow
                key={activity.id}
                activity={activity}
                index={i}
                onShare={(a) => {
                  share(a);
                }}
              />
            ))}
          </View>
        ) : (
          <SectionHeader
            title="No workouts yet"
            subtitle="Start a walk or run above to see sessions here."
          />
        )}
      </ScrollView>
      {hiddenCard}
    </View>
  );
}
