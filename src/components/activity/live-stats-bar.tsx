import { Text, View } from "react-native";

import { fonts, radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ActiveSession } from "@/lib/activity/activity-types";
import { formatDistanceKm, formatDuration, formatCalories, formatPace } from "@/lib/activity/activity-format";

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", gap: 2, flex: 1 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.text }}>{value}</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textFaint }}>{label}</Text>
    </View>
  );
}

export function LiveStatsBar({ session }: { session: ActiveSession }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.accentBorder,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Stat label="time" value={formatDuration(session.durationMs)} />
      <Stat label="distance" value={formatDistanceKm(session.distanceM)} />
      <Stat
        label={session.activeCaloriesKcal != null ? "cal" : "pace"}
        value={
          session.activeCaloriesKcal != null
            ? formatCalories(session.activeCaloriesKcal)
            : formatPace(session.avgPaceSPerKm)
        }
      />
      <Stat label="new" value={String(session.newTiles)} />
    </View>
  );
}
