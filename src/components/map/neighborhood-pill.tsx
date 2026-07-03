import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { GlassCard } from "@/components/ui/glass-card";
import { fonts, radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { estimateCellCount, type BoundingBox } from "@/lib/h3";
import { formatPercent } from "@/lib/stats/format";
import { coverageFraction } from "@/lib/stats/stats-service";
import { stompEngine } from "@/lib/stomp/stomp-engine";

/** ~1.2 km square around the user approximates a neighborhood in v1. */
const NEIGHBORHOOD_HALF_SPAN_DEG = 0.0054;
const GEOCODE_MIN_INTERVAL_MS = 60_000;

interface NeighborhoodPillProps {
  position: { latitude: number; longitude: number } | null;
}

export function NeighborhoodPill({ position }: NeighborhoodPillProps) {
  const { colors } = useTheme();
  const [name, setName] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<number | null>(null);
  const lastGeocodeAt = useRef(0);

  useEffect(() => {
    if (!position) return;

    const box: BoundingBox = {
      north: position.latitude + NEIGHBORHOOD_HALF_SPAN_DEG,
      south: position.latitude - NEIGHBORHOOD_HALF_SPAN_DEG,
      east: position.longitude + NEIGHBORHOOD_HALF_SPAN_DEG,
      west: position.longitude - NEIGHBORHOOD_HALF_SPAN_DEG,
    };

    const refreshCoverage = () => {
      setCoverage(
        coverageFraction(
          box.north,
          box.south,
          box.east,
          box.west,
          estimateCellCount(box),
        ),
      );
    };
    refreshCoverage();
    const unsubscribe = stompEngine.on("stats:changed", refreshCoverage);

    if (Date.now() - lastGeocodeAt.current > GEOCODE_MIN_INTERVAL_MS) {
      lastGeocodeAt.current = Date.now();
      Location.reverseGeocodeAsync({
        latitude: position.latitude,
        longitude: position.longitude,
      })
        .then((results) => {
          const place = results[0];
          const label =
            place?.subregion && place?.city && place.subregion !== place.city
              ? place.subregion
              : (place?.district ?? place?.city ?? place?.region ?? null);
          if (label) setName(label);
        })
        .catch(() => {});
    }

    return unsubscribe;
  }, [position?.latitude, position?.longitude]);

  if (!position || coverage == null) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(420).delay(80).springify()}
      style={{ maxWidth: "100%" }}
    >
    <GlassCard borderRadius={radius.pill}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 10,
          paddingHorizontal: 18,
        }}
      >
        <Text
          style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.text }}
          numberOfLines={1}
        >
          {name ?? "This area"}
        </Text>
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.textFaint,
          }}
        />
        <Text
          style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.ember }}
        >
          {formatPercent(coverage)} stomped
        </Text>
      </View>
    </GlassCard>
    </Animated.View>
  );
}
