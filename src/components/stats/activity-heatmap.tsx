import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { colors, fonts, heatColor, radius } from "@/constants/theme";
import { useDailyActivity } from "@/hooks/use-daily-activity";
import { useSetting } from "@/hooks/use-settings";
import { formatCompact, formatDistance, type Units } from "@/lib/stats/format";
import type { DailyStat } from "@/lib/storage/tile-db";
import { SETTINGS_KEYS } from "@/lib/storage/settings";

const WEEKS = 12;
const DAYS = WEEKS * 7;
const CELL = 11;
const GAP = 3;

function activityFill(newTiles: number, peak: number): string {
  if (newTiles <= 0) return colors.fog;
  const intensity = Math.min(1, newTiles / peak);
  if (intensity < 0.34) return colors.emberDim;
  if (intensity < 0.67) return colors.ember;
  return colors.emberLight;
}

function formatDayLabel(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function DayDetail({ day, units }: { day: DailyStat; units: Units }) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 4,
      }}
    >
      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.text }}>
        {formatDayLabel(day.day)}
      </Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted }}>
        {day.newTiles > 0
          ? `${formatCompact(day.newTiles)} new tiles · ${formatDistance(day.distanceM, units)}`
          : "No new tiles — rest day or offline."}
      </Text>
    </Animated.View>
  );
}

export function ActivityHeatmap() {
  const activity = useDailyActivity(DAYS);
  const [units] = useSetting<Units>(SETTINGS_KEYS.units, "mi");
  const [selected, setSelected] = useState<DailyStat | null>(null);

  const peak = useMemo(
    () => Math.max(1, ...activity.map((day) => day.newTiles)),
    [activity],
  );

  const weeks = useMemo(() => {
    const padded = [...activity];
    while (padded.length % 7 !== 0) padded.unshift({ day: "", distanceM: 0, newTiles: 0 });
    const cols: DailyStat[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }
    return cols;
  }, [activity]);

  const handleSelect = (day: DailyStat) => {
    if (!day.day) return;
    if (process.env.EXPO_OS === "ios") {
      Haptics.selectionAsync();
    }
    setSelected(day);
  };

  const activeDay = selected ?? activity[activity.length - 1];

  return (
    <Animated.View
      entering={FadeInDown.duration(380).delay(120)}
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 18,
        gap: 14,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 17, color: colors.text }}>
          Activity heatmap
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}>
          Tap a day to inspect tiles and distance. Darker ember = more new ground.
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: GAP }}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={{ gap: GAP }}>
            {week.map((day, dayIndex) => {
              const isSelected = selected?.day === day.day;
              const hasData = day.day.length > 0;
              return (
                <Pressable
                  key={day.day || `pad-${weekIndex}-${dayIndex}`}
                  disabled={!hasData}
                  onPress={() => handleSelect(day)}
                  style={({ pressed }) => ({
                    width: CELL,
                    height: CELL,
                    borderRadius: 3,
                    backgroundColor: hasData
                      ? activityFill(day.newTiles, peak)
                      : "transparent",
                    borderWidth: isSelected ? 1.5 : 0,
                    borderColor: colors.text,
                    opacity: pressed ? 0.75 : 1,
                  })}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textFaint }}>
          Less
        </Text>
        {[0, 0.33, 0.66, 1].map((level) => (
          <View
            key={level}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              backgroundColor:
                level === 0 ? colors.fog : activityFill(Math.ceil(peak * level), peak),
            }}
          />
        ))}
        <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textFaint }}>
          More
        </Text>
      </View>

      {activeDay ? <DayDetail day={activeDay} units={units} /> : null}
    </Animated.View>
  );
}
