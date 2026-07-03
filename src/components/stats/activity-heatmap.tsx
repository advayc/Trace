import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { fonts, radius, spacing, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useDailyActivity } from "@/hooks/use-daily-activity";
import { useSetting } from "@/hooks/use-settings";
import { formatCompact, formatDistance, type Units } from "@/lib/stats/format";
import type { DailyStat } from "@/lib/storage/tile-db";
import { SETTINGS_KEYS } from "@/lib/storage/settings";

const WEEKS = 12;
const DAYS = WEEKS * 7;
const GAP = 3;
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

interface ActivityHeatmapProps {
  fullWidth?: boolean;
  compact?: boolean;
}

function activityFill(colors: ThemeColors, newTiles: number, peak: number): string {
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

export function ActivityHeatmap({ fullWidth = false, compact = false }: ActivityHeatmapProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const activity = useDailyActivity(DAYS);
  const [units] = useSetting<Units>(SETTINGS_KEYS.units, "km");
  const [selected, setSelected] = useState<DailyStat | null>(null);

  const peak = useMemo(
    () => Math.max(1, ...activity.map((day) => day.newTiles)),
    [activity],
  );

  const weeks = useMemo(() => {
    const padded = [...activity];
    const firstDay = padded[0]?.day;
    if (firstDay) {
      const [year, month, date] = firstDay.split("-").map(Number);
      const leading = new Date(year, month - 1, date).getDay();
      for (let i = 0; i < leading; i += 1) {
        padded.unshift({ day: "", distanceM: 0, newTiles: 0 });
      }
    }
    const cols: DailyStat[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }
    return cols;
  }, [activity]);

  const weekdayColWidth = compact ? 14 : 20;
  const horizontalPadding = fullWidth ? 16 : 18;
  const containerWidth = fullWidth ? screenWidth : screenWidth - spacing.screen * 2;
  const gridWidth =
    containerWidth - horizontalPadding * 2 - weekdayColWidth - (compact ? 6 : 8);
  const cellSize = Math.max(
    8,
    Math.floor((gridWidth - (weeks.length - 1) * GAP) / weeks.length),
  );

  const handleSelect = (day: DailyStat) => {
    if (!day.day) return;
    if (process.env.EXPO_OS === "ios") {
      Haptics.selectionAsync();
    }
    setSelected(day);
  };

  const activeDay = selected ?? activity[activity.length - 1];
  const monthLabels = useMemo(
    () =>
      weeks.map((week) => {
        const first = week.find((day) => day.day);
        if (!first) return "";
        const [, month, date] = first.day.split("-").map(Number);
        if (date > 7) return "";
        return new Date(2000, month - 1, 1).toLocaleDateString(undefined, {
          month: "short",
        });
      }),
    [weeks],
  );

  return (
    <Animated.View
      entering={FadeInDown.duration(380).delay(120)}
      style={{
        marginHorizontal: fullWidth ? -spacing.screen : 0,
        backgroundColor: colors.surfaceRaised,
        borderRadius: fullWidth ? 0 : radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: horizontalPadding,
        paddingVertical: compact ? 12 : 18,
        gap: compact ? 8 : 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1, gap: compact ? 2 : 4 }}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: compact ? 16 : 17, color: colors.text }}>
            Activity heatmap
          </Text>
          {!compact ? (
            <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}>
              Tap a day to inspect tiles and distance.
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {[0, 0.33, 0.66, 1].map((level) => (
            <View
              key={level}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor:
                  level === 0 ? colors.fog : activityFill(colors, Math.ceil(peak * level), peak),
              }}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <View style={{ gap: GAP }}>
            {WEEKDAY_LABELS.map((label, i) => (
              <View
                key={`${label}-${i}`}
                style={{ width: weekdayColWidth, height: cellSize, justifyContent: "center" }}
              >
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 8,
                    color: colors.textFaint,
                  }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ flex: 1, flexDirection: "row", gap: GAP }}>
            {weeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={{ flex: 1, gap: GAP }}>
                {week.map((day, dayIndex) => {
                  const isSelected = selected?.day === day.day;
                  const hasData = day.day.length > 0;
                  return (
                    <Pressable
                      key={day.day || `pad-${weekIndex}-${dayIndex}`}
                      disabled={!hasData}
                      onPress={() => handleSelect(day)}
                      style={({ pressed }) => ({
                        width: "100%",
                        aspectRatio: 1,
                        maxHeight: cellSize,
                        borderRadius: 3,
                        backgroundColor: hasData
                          ? activityFill(colors, day.newTiles, peak)
                          : "transparent",
                        borderWidth: isSelected ? 1.5 : 1,
                        borderColor: isSelected ? colors.text : colors.border,
                        opacity: pressed ? 0.75 : 1,
                      })}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: GAP }}>
          <View style={{ width: weekdayColWidth }} />
          {monthLabels.map((label, index) => (
            <Text
              key={`month-${index}`}
              style={{
                flex: 1,
                fontFamily: fonts.medium,
                fontSize: 8,
                color: colors.textFaint,
                textAlign: "center",
              }}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>

      {activeDay?.day ? (
        <Animated.View entering={FadeIn.duration(200)}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted }}>
            <Text style={{ color: colors.text }}>{formatDayLabel(activeDay.day)}</Text>
            {" · "}
            {activeDay.newTiles > 0
              ? `${formatCompact(activeDay.newTiles)} new tiles · ${formatDistance(activeDay.distanceM, units)}`
              : "No new tiles"}
          </Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
