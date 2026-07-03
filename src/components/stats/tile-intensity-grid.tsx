import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from "react-native-reanimated";

import { fonts, heatColor, radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTileVisitSamples } from "@/hooks/use-daily-activity";
import { formatCompact } from "@/lib/stats/format";

const COLS = 12;

export function TileIntensityGrid() {
  const { colors } = useTheme();
  const samples = useTileVisitSamples(96);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const bands = useMemo(() => {
    const once = samples.filter((t) => t.visitCount <= 1).length;
    const familiar = samples.filter((t) => t.visitCount >= 2 && t.visitCount <= 3).length;
    const wellWorn = samples.filter((t) => t.visitCount >= 4 && t.visitCount <= 7).length;
    const legendary = samples.filter((t) => t.visitCount >= 8).length;
    return { once, familiar, wellWorn, legendary };
  }, [samples]);

  const selected = selectedIndex !== null ? samples[selectedIndex] : null;

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1 : 0.98, { damping: 14 }) }],
  }));

  const handleSelect = (index: number) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  if (samples.length === 0) {
    return (
      <Animated.View
        entering={FadeInDown.duration(380).delay(180)}
        style={{
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 18,
          gap: 8,
        }}
      >
        <Text style={{ fontFamily: fonts.semibold, fontSize: 17, color: colors.text }}>
          Revisit intensity
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted }}>
          Walk to reveal tiles — this grid lights up as you cover ground.
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(380).delay(180)}
      style={[
        {
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 18,
          gap: 14,
        },
        highlightStyle,
      ]}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 17, color: colors.text }}>
          Revisit intensity
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}>
          Recent tiles by how often you&apos;ve walked them. Tap a cell for detail.
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
        {samples.map((tile, index) => {
          const active = selectedIndex === index;
          return (
            <Pressable
              key={`tile-${index}`}
              onPress={() => handleSelect(index)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 5,
                backgroundColor: heatColor(tile.visitCount),
                borderWidth: active ? 2 : 0,
                borderColor: colors.text,
                opacity: selectedIndex !== null && !active ? 0.45 : 1,
              }}
            />
          );
        })}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[
          { label: "1×", count: bands.once, color: heatColor(1) },
          { label: "2–3×", count: bands.familiar, color: heatColor(2) },
          { label: "4–7×", count: bands.wellWorn, color: heatColor(5) },
          { label: "8+×", count: bands.legendary, color: heatColor(8) },
        ].map((band) => (
          <View
            key={band.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: radius.sm,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: band.color,
              }}
            />
            <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted }}>
              {band.label} · {formatCompact(band.count)}
            </Text>
          </View>
        ))}
      </View>

      {selected ? (
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.text }}>
          Selected tile visited{" "}
          <Text style={{ fontFamily: fonts.semibold, color: colors.emberLight }}>
            {selected.visitCount} {selected.visitCount === 1 ? "time" : "times"}
          </Text>
          .
        </Text>
      ) : (
        <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textFaint }}>
          {formatCompact(samples.length)} recent tiles shown in a {COLS}-wide grid.
        </Text>
      )}
    </Animated.View>
  );
}
